import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import apiClient from '../api/client'; // Your modular Axios client

// Define validation rules using Zod (Zod v4 compatible check)
const createOrgSchema = z.object({
  name: z.string().min(3, 'Organization name must be at least 3 characters'),
  phone: z.string().min(2, 'Please enter your organization phone'),
  address: z.string().optional().or(z.literal('')), // عشان لو اليوزر سابه فاضي ما يضربش خطأ
});

export default function OnboardingPage() {
  const [step, setStep] = useState('choice'); // 'choice' | 'create' | 'join'
  const [loading, setLoading] = useState(false);
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const navigate = useNavigate();

  // Initialize React Hook Form with Zod validation
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(createOrgSchema)
  });

  console.log("ay haga")
  // Handle creating a new organization
  const onCreateOrgSubmit = async (data) => {
    setLoading(true);
    try {
      // 1. Send data to the backend API
      await apiClient.post('/organization/', data); 
      
      // 2. Zustand Sync: Re-run auth initialization to fetch fresh user data and new owner permissions
      await initializeAuth(); 
      
      // 3. Redirect immediately to the dashboard now that organization_id and RBAC roles are populated
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error('Failed to create organization', error);
      alert('An error occurred while creating the organization. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome to the ERP System</h2>
        <p className="mt-2 text-sm text-slate-600">To get started, please set up your workspace environment first</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-4 shadow-xs rounded-xl sm:px-10 border border-slate-100">
          
          {/* Step 1: Choice between Creating or Joining an Organization */}
          {step === 'choice' && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <button 
                onClick={() => setStep('create')}
                className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-xl hover:border-blue-500 hover:bg-blue-50/50 transition cursor-pointer text-center group"
              >
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl group-hover:bg-blue-200">＋</div>
                <h3 className="mt-4 text-lg font-semibold text-slate-800">Create New Organization</h3>
                <p className="mt-1 text-xs text-slate-500">Start as a Founder and manage all permissions and members</p>
              </button>

              <button 
                onClick={() => setStep('join')}
                className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-xl hover:border-emerald-500 hover:bg-emerald-50/50 transition cursor-pointer text-center group"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-xl group-hover:bg-emerald-200">➔</div>
                <h3 className="mt-4 text-lg font-semibold text-slate-800">Wait for an Invitation</h3>
                <p className="mt-1 text-xs text-slate-500">Wait for an invitation sent by your workspace administrator</p>
              </button>
            </div>
          )}

          {/* Step 2: Form to Create a New Organization */}
          {step === 'create' && (
            <form onSubmit={handleSubmit(onCreateOrgSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Company / Organization Name *</label>
                <input
                  type="text"
                  {...register('name')}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-950 ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-slate-300'}`}
                  placeholder="e.g., Global Trading LLC"
                />
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone *</label>
                <input
                  type="text"
                  {...register('phone')}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-950 ${errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-slate-300'}`}
                  placeholder="e.g., +2 324 562 24"
                />
                {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Company Address (Optional)</label>
                <textarea
                  {...register('address')}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-950"
                  placeholder="Tell us your company address (optional)"
                />
              </div>

              <div className="flex justify-between items-center pt-2">
                <button type="button" onClick={() => setStep('choice')} className="text-sm text-slate-600 hover:underline">Back</button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-xs transition disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Creating...' : 'Create & Setup Organization'}
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Form to Join via Invite Code */}
          {step === 'join' && (<>  
            <button type="button" onClick={() => setStep('choice')} className="text-sm text-slate-600 hover:underline">Back</button>
            <div className="flex justify-between items-center text-center pt-2">
                Wait for the admin to send you an invitation code. Once you receive it, enter it here to join the organization.
              </div>
          </>)}
        </div>
      </div>
    </div>
  );
}

