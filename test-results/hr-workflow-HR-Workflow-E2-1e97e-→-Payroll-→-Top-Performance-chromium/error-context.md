# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: hr-workflow.spec.js >> HR Workflow E2E >> Core HR workflow: Login → Employees → Attendance → Payroll → Top Performance
- Location: e2e\hr-workflow.spec.js:70:3

# Error details

```
TimeoutError: locator.isEnabled: Timeout 3000ms exceeded.
Call log:
  - waiting for locator('[role="dialog"]').getByRole('button', { name: /^Import$/ })

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - complementary [ref=e4]:
    - generic [ref=e5]:
      - img [ref=e7]
      - generic [ref=e9]: NexusERP
    - navigation [ref=e10]:
      - list [ref=e12]:
        - listitem [ref=e13]:
          - link "Profile" [ref=e14] [cursor=pointer]:
            - /url: /profile
            - img [ref=e15]
            - text: Profile
      - generic [ref=e17]:
        - paragraph [ref=e18]: Human Resources
        - list [ref=e19]:
          - listitem [ref=e20]:
            - link "Top Performance" [ref=e21] [cursor=pointer]:
              - /url: /hr/top-performance
              - img [ref=e22]
              - text: Top Performance
          - listitem [ref=e24]:
            - link "Employees" [ref=e25] [cursor=pointer]:
              - /url: /hr/employees
              - img [ref=e26]
              - text: Employees
          - listitem [ref=e28]:
            - link "Attendance" [ref=e29] [cursor=pointer]:
              - /url: /hr/attendance
              - img [ref=e30]
              - text: Attendance
          - listitem [ref=e32]:
            - link "Leave Requests" [ref=e33] [cursor=pointer]:
              - /url: /hr/leave-requests
              - img [ref=e34]
              - text: Leave Requests
          - listitem [ref=e36]:
            - link "Payroll" [ref=e37] [cursor=pointer]:
              - /url: /hr/payroll
              - img [ref=e38]
              - text: Payroll
      - generic [ref=e40]:
        - paragraph [ref=e41]: Administration
        - list [ref=e42]:
          - listitem [ref=e43]:
            - link "Roles & Permissions" [ref=e44] [cursor=pointer]:
              - /url: /admin/roles
              - img [ref=e45]
              - text: Roles & Permissions
          - listitem [ref=e47]:
            - link "Activity Logs" [ref=e48] [cursor=pointer]:
              - /url: /admin/activity-logs
              - img [ref=e49]
              - text: Activity Logs
    - generic [ref=e51]:
      - generic [ref=e52]:
        - generic [ref=e53]: ET
        - generic [ref=e54]:
          - paragraph [ref=e55]: E2E Test
          - paragraph [ref=e56]: hr_manager
      - button "Sign out" [ref=e57]:
        - img [ref=e58]
        - text: Sign out
  - generic [ref=e60]:
    - banner [ref=e61]:
      - generic [ref=e62]:
        - paragraph [ref=e63]: Human Resources
        - heading "Attendance" [level=1] [ref=e64]
      - generic [ref=e65]:
        - button "Notifications" [ref=e66]:
          - img [ref=e67]
        - link "ET E2E Test hr_manager" [ref=e71] [cursor=pointer]:
          - /url: /profile
          - generic [ref=e72]: ET
          - generic [ref=e73]:
            - paragraph [ref=e74]: E2E Test
            - paragraph [ref=e75]: hr_manager
    - main [ref=e76]:
      - generic [ref=e77]:
        - generic [ref=e78]:
          - generic [ref=e79]:
            - heading "Attendance" [level=1] [ref=e80]:
              - img [ref=e81]
              - text: Attendance
            - paragraph [ref=e83]: Track employee attendance, check-ins, and absences.
          - generic [ref=e84]:
            - button "Import" [ref=e85]:
              - img [ref=e86]
              - text: Import
            - button "Export" [ref=e89]:
              - img [ref=e90]
              - text: Export
            - button "Refresh" [ref=e92]:
              - img [ref=e93]
              - text: Refresh
            - button "Add Record" [ref=e95]:
              - img [ref=e96]
              - text: Add Record
        - generic [ref=e98]:
          - generic [ref=e99]:
            - generic [ref=e100]:
              - generic [ref=e101]:
                - paragraph [ref=e102]: Present Today
                - heading "6" [level=3] [ref=e103]
              - img [ref=e105]
            - paragraph [ref=e107]: On time arrivals
          - generic [ref=e108]:
            - generic [ref=e109]:
              - generic [ref=e110]:
                - paragraph [ref=e111]: Absent Today
                - heading "0" [level=3] [ref=e112]
              - img [ref=e114]
            - paragraph [ref=e116]: No show
          - generic [ref=e117]:
            - generic [ref=e118]:
              - generic [ref=e119]:
                - paragraph [ref=e120]: Late Today
                - heading "0" [level=3] [ref=e121]
              - img [ref=e123]
            - paragraph [ref=e125]: Arrived after start
          - generic [ref=e126]:
            - generic [ref=e127]:
              - generic [ref=e128]:
                - paragraph [ref=e129]: This Month
                - heading "54" [level=3] [ref=e130]
              - img [ref=e132]
            - paragraph [ref=e134]: Total records
        - search "Filter attendance records" [ref=e135]:
          - generic [ref=e136]:
            - img
            - textbox "Search employees…" [ref=e137]
          - generic [ref=e138]:
            - img
            - combobox [ref=e139] [cursor=pointer]:
              - option "All Departments" [selected]
              - option "Human Resources"
              - option "Inventory"
              - option "Sales"
              - option "Engineering"
              - option "Finance"
              - option "Marketing"
          - generic [ref=e140]:
            - img
            - combobox [ref=e141] [cursor=pointer]:
              - option "All Statuses" [selected]
              - option "Present"
              - option "Absent"
              - option "Late"
              - option "Leave"
              - option "Holiday"
          - generic [ref=e142]:
            - img
            - textbox [ref=e143]:
              - /placeholder: From
          - generic [ref=e144]:
            - img
            - textbox [ref=e145]:
              - /placeholder: To
        - generic [ref=e146]:
          - generic [ref=e148]:
            - img [ref=e149]
            - paragraph [ref=e151]: Attendance Records
            - generic [ref=e152]: "54"
          - table "Attendance table" [ref=e154]:
            - rowgroup [ref=e155]:
              - row "Select all Employee Date Check In Check Out Overtime Status Actions" [ref=e156]:
                - columnheader "Select all" [ref=e157]:
                  - checkbox "Select all" [ref=e158] [cursor=pointer]
                - columnheader "Employee" [ref=e159] [cursor=pointer]:
                  - generic [ref=e160]:
                    - text: Employee
                    - img [ref=e161]
                - columnheader "Date" [ref=e163] [cursor=pointer]:
                  - generic [ref=e164]:
                    - text: Date
                    - img [ref=e165]
                - columnheader "Check In" [ref=e167]
                - columnheader "Check Out" [ref=e168]
                - columnheader "Overtime" [ref=e169]
                - columnheader "Status" [ref=e170] [cursor=pointer]:
                  - generic [ref=e171]:
                    - text: Status
                    - img [ref=e172]
                - columnheader "Actions" [ref=e174]
            - rowgroup [ref=e175]:
              - row "Select Youssef Ragheb Youssef Ragheb Engineering Jul 13, 2026 09:00 18:00 1h Present View details for Youssef Ragheb Edit Youssef Ragheb Delete record for Youssef Ragheb" [ref=e176] [cursor=pointer]:
                - cell "Select Youssef Ragheb" [ref=e177]:
                  - checkbox "Select Youssef Ragheb" [ref=e178]
                - cell "Youssef Ragheb Engineering" [ref=e179]:
                  - paragraph [ref=e180]: Youssef Ragheb
                  - paragraph [ref=e181]: Engineering
                - cell "Jul 13, 2026" [ref=e182]
                - cell "09:00" [ref=e183]
                - cell "18:00" [ref=e184]
                - cell "1h" [ref=e185]
                - cell "Present" [ref=e186]:
                  - generic [ref=e187]: Present
                - cell "View details for Youssef Ragheb Edit Youssef Ragheb Delete record for Youssef Ragheb" [ref=e189]:
                  - generic [ref=e190]:
                    - button "View details for Youssef Ragheb" [ref=e191]:
                      - img [ref=e192]
                    - button "Edit Youssef Ragheb" [ref=e194]:
                      - img [ref=e195]
                    - button "Delete record for Youssef Ragheb" [ref=e197]:
                      - img [ref=e198]
              - row "Select Hassan Emad Hassan Emad Hr Jul 13, 2026 09:00 17:00 0h Present View details for Hassan Emad Edit Hassan Emad Delete record for Hassan Emad" [ref=e200] [cursor=pointer]:
                - cell "Select Hassan Emad" [ref=e201]:
                  - checkbox "Select Hassan Emad" [ref=e202]
                - cell "Hassan Emad Hr" [ref=e203]:
                  - paragraph [ref=e204]: Hassan Emad
                  - paragraph [ref=e205]: Hr
                - cell "Jul 13, 2026" [ref=e206]
                - cell "09:00" [ref=e207]
                - cell "17:00" [ref=e208]
                - cell "0h" [ref=e209]
                - cell "Present" [ref=e210]:
                  - generic [ref=e211]: Present
                - cell "View details for Hassan Emad Edit Hassan Emad Delete record for Hassan Emad" [ref=e213]:
                  - generic [ref=e214]:
                    - button "View details for Hassan Emad" [ref=e215]:
                      - img [ref=e216]
                    - button "Edit Hassan Emad" [ref=e218]:
                      - img [ref=e219]
                    - button "Delete record for Hassan Emad" [ref=e221]:
                      - img [ref=e222]
              - row "Select Ziad Ammar Ziad Ammar Sales Jul 13, 2026 09:00 17:00 0h Present View details for Ziad Ammar Edit Ziad Ammar Delete record for Ziad Ammar" [ref=e224] [cursor=pointer]:
                - cell "Select Ziad Ammar" [ref=e225]:
                  - checkbox "Select Ziad Ammar" [ref=e226]
                - cell "Ziad Ammar Sales" [ref=e227]:
                  - paragraph [ref=e228]: Ziad Ammar
                  - paragraph [ref=e229]: Sales
                - cell "Jul 13, 2026" [ref=e230]
                - cell "09:00" [ref=e231]
                - cell "17:00" [ref=e232]
                - cell "0h" [ref=e233]
                - cell "Present" [ref=e234]:
                  - generic [ref=e235]: Present
                - cell "View details for Ziad Ammar Edit Ziad Ammar Delete record for Ziad Ammar" [ref=e237]:
                  - generic [ref=e238]:
                    - button "View details for Ziad Ammar" [ref=e239]:
                      - img [ref=e240]
                    - button "Edit Ziad Ammar" [ref=e242]:
                      - img [ref=e243]
                    - button "Delete record for Ziad Ammar" [ref=e245]:
                      - img [ref=e246]
              - row "Select Eslam Adel Eslam Adel Finance Jul 13, 2026 09:00 17:00 0h Present View details for Eslam Adel Edit Eslam Adel Delete record for Eslam Adel" [ref=e248] [cursor=pointer]:
                - cell "Select Eslam Adel" [ref=e249]:
                  - checkbox "Select Eslam Adel" [ref=e250]
                - cell "Eslam Adel Finance" [ref=e251]:
                  - paragraph [ref=e252]: Eslam Adel
                  - paragraph [ref=e253]: Finance
                - cell "Jul 13, 2026" [ref=e254]
                - cell "09:00" [ref=e255]
                - cell "17:00" [ref=e256]
                - cell "0h" [ref=e257]
                - cell "Present" [ref=e258]:
                  - generic [ref=e259]: Present
                - cell "View details for Eslam Adel Edit Eslam Adel Delete record for Eslam Adel" [ref=e261]:
                  - generic [ref=e262]:
                    - button "View details for Eslam Adel" [ref=e263]:
                      - img [ref=e264]
                    - button "Edit Eslam Adel" [ref=e266]:
                      - img [ref=e267]
                    - button "Delete record for Eslam Adel" [ref=e269]:
                      - img [ref=e270]
              - row "Select Radwa Ramadan Radwa Ramadan Inventory Jul 13, 2026 09:00 17:00 0h Present View details for Radwa Ramadan Edit Radwa Ramadan Delete record for Radwa Ramadan" [ref=e272] [cursor=pointer]:
                - cell "Select Radwa Ramadan" [ref=e273]:
                  - checkbox "Select Radwa Ramadan" [ref=e274]
                - cell "Radwa Ramadan Inventory" [ref=e275]:
                  - paragraph [ref=e276]: Radwa Ramadan
                  - paragraph [ref=e277]: Inventory
                - cell "Jul 13, 2026" [ref=e278]
                - cell "09:00" [ref=e279]
                - cell "17:00" [ref=e280]
                - cell "0h" [ref=e281]
                - cell "Present" [ref=e282]:
                  - generic [ref=e283]: Present
                - cell "View details for Radwa Ramadan Edit Radwa Ramadan Delete record for Radwa Ramadan" [ref=e285]:
                  - generic [ref=e286]:
                    - button "View details for Radwa Ramadan" [ref=e287]:
                      - img [ref=e288]
                    - button "Edit Radwa Ramadan" [ref=e290]:
                      - img [ref=e291]
                    - button "Delete record for Radwa Ramadan" [ref=e293]:
                      - img [ref=e294]
              - row "Select Ali Adel Ali Adel Marketing Jul 13, 2026 09:00 17:00 0h Present View details for Ali Adel Edit Ali Adel Delete record for Ali Adel" [ref=e296] [cursor=pointer]:
                - cell "Select Ali Adel" [ref=e297]:
                  - checkbox "Select Ali Adel" [ref=e298]
                - cell "Ali Adel Marketing" [ref=e299]:
                  - paragraph [ref=e300]: Ali Adel
                  - paragraph [ref=e301]: Marketing
                - cell "Jul 13, 2026" [ref=e302]
                - cell "09:00" [ref=e303]
                - cell "17:00" [ref=e304]
                - cell "0h" [ref=e305]
                - cell "Present" [ref=e306]:
                  - generic [ref=e307]: Present
                - cell "View details for Ali Adel Edit Ali Adel Delete record for Ali Adel" [ref=e309]:
                  - generic [ref=e310]:
                    - button "View details for Ali Adel" [ref=e311]:
                      - img [ref=e312]
                    - button "Edit Ali Adel" [ref=e314]:
                      - img [ref=e315]
                    - button "Delete record for Ali Adel" [ref=e317]:
                      - img [ref=e318]
              - row "Select Youssef Ragheb Youssef Ragheb Engineering Jul 12, 2026 09:00 17:00 0h Present View details for Youssef Ragheb Edit Youssef Ragheb Delete record for Youssef Ragheb" [ref=e320] [cursor=pointer]:
                - cell "Select Youssef Ragheb" [ref=e321]:
                  - checkbox "Select Youssef Ragheb" [ref=e322]
                - cell "Youssef Ragheb Engineering" [ref=e323]:
                  - paragraph [ref=e324]: Youssef Ragheb
                  - paragraph [ref=e325]: Engineering
                - cell "Jul 12, 2026" [ref=e326]
                - cell "09:00" [ref=e327]
                - cell "17:00" [ref=e328]
                - cell "0h" [ref=e329]
                - cell "Present" [ref=e330]:
                  - generic [ref=e331]: Present
                - cell "View details for Youssef Ragheb Edit Youssef Ragheb Delete record for Youssef Ragheb" [ref=e333]:
                  - generic [ref=e334]:
                    - button "View details for Youssef Ragheb" [ref=e335]:
                      - img [ref=e336]
                    - button "Edit Youssef Ragheb" [ref=e338]:
                      - img [ref=e339]
                    - button "Delete record for Youssef Ragheb" [ref=e341]:
                      - img [ref=e342]
              - row "Select Hassan Emad Hassan Emad Hr Jul 12, 2026 09:00 17:00 0h Present View details for Hassan Emad Edit Hassan Emad Delete record for Hassan Emad" [ref=e344] [cursor=pointer]:
                - cell "Select Hassan Emad" [ref=e345]:
                  - checkbox "Select Hassan Emad" [ref=e346]
                - cell "Hassan Emad Hr" [ref=e347]:
                  - paragraph [ref=e348]: Hassan Emad
                  - paragraph [ref=e349]: Hr
                - cell "Jul 12, 2026" [ref=e350]
                - cell "09:00" [ref=e351]
                - cell "17:00" [ref=e352]
                - cell "0h" [ref=e353]
                - cell "Present" [ref=e354]:
                  - generic [ref=e355]: Present
                - cell "View details for Hassan Emad Edit Hassan Emad Delete record for Hassan Emad" [ref=e357]:
                  - generic [ref=e358]:
                    - button "View details for Hassan Emad" [ref=e359]:
                      - img [ref=e360]
                    - button "Edit Hassan Emad" [ref=e362]:
                      - img [ref=e363]
                    - button "Delete record for Hassan Emad" [ref=e365]:
                      - img [ref=e366]
              - row "Select Ziad Ammar Ziad Ammar Sales Jul 12, 2026 09:00 17:00 0h Present View details for Ziad Ammar Edit Ziad Ammar Delete record for Ziad Ammar" [ref=e368] [cursor=pointer]:
                - cell "Select Ziad Ammar" [ref=e369]:
                  - checkbox "Select Ziad Ammar" [ref=e370]
                - cell "Ziad Ammar Sales" [ref=e371]:
                  - paragraph [ref=e372]: Ziad Ammar
                  - paragraph [ref=e373]: Sales
                - cell "Jul 12, 2026" [ref=e374]
                - cell "09:00" [ref=e375]
                - cell "17:00" [ref=e376]
                - cell "0h" [ref=e377]
                - cell "Present" [ref=e378]:
                  - generic [ref=e379]: Present
                - cell "View details for Ziad Ammar Edit Ziad Ammar Delete record for Ziad Ammar" [ref=e381]:
                  - generic [ref=e382]:
                    - button "View details for Ziad Ammar" [ref=e383]:
                      - img [ref=e384]
                    - button "Edit Ziad Ammar" [ref=e386]:
                      - img [ref=e387]
                    - button "Delete record for Ziad Ammar" [ref=e389]:
                      - img [ref=e390]
              - row "Select Eslam Adel Eslam Adel Finance Jul 12, 2026 09:00 17:00 0h Present View details for Eslam Adel Edit Eslam Adel Delete record for Eslam Adel" [ref=e392] [cursor=pointer]:
                - cell "Select Eslam Adel" [ref=e393]:
                  - checkbox "Select Eslam Adel" [ref=e394]
                - cell "Eslam Adel Finance" [ref=e395]:
                  - paragraph [ref=e396]: Eslam Adel
                  - paragraph [ref=e397]: Finance
                - cell "Jul 12, 2026" [ref=e398]
                - cell "09:00" [ref=e399]
                - cell "17:00" [ref=e400]
                - cell "0h" [ref=e401]
                - cell "Present" [ref=e402]:
                  - generic [ref=e403]: Present
                - cell "View details for Eslam Adel Edit Eslam Adel Delete record for Eslam Adel" [ref=e405]:
                  - generic [ref=e406]:
                    - button "View details for Eslam Adel" [ref=e407]:
                      - img [ref=e408]
                    - button "Edit Eslam Adel" [ref=e410]:
                      - img [ref=e411]
                    - button "Delete record for Eslam Adel" [ref=e413]:
                      - img [ref=e414]
              - row "Select Radwa Ramadan Radwa Ramadan Inventory Jul 12, 2026 09:00 17:00 0h Present View details for Radwa Ramadan Edit Radwa Ramadan Delete record for Radwa Ramadan" [ref=e416] [cursor=pointer]:
                - cell "Select Radwa Ramadan" [ref=e417]:
                  - checkbox "Select Radwa Ramadan" [ref=e418]
                - cell "Radwa Ramadan Inventory" [ref=e419]:
                  - paragraph [ref=e420]: Radwa Ramadan
                  - paragraph [ref=e421]: Inventory
                - cell "Jul 12, 2026" [ref=e422]
                - cell "09:00" [ref=e423]
                - cell "17:00" [ref=e424]
                - cell "0h" [ref=e425]
                - cell "Present" [ref=e426]:
                  - generic [ref=e427]: Present
                - cell "View details for Radwa Ramadan Edit Radwa Ramadan Delete record for Radwa Ramadan" [ref=e429]:
                  - generic [ref=e430]:
                    - button "View details for Radwa Ramadan" [ref=e431]:
                      - img [ref=e432]
                    - button "Edit Radwa Ramadan" [ref=e434]:
                      - img [ref=e435]
                    - button "Delete record for Radwa Ramadan" [ref=e437]:
                      - img [ref=e438]
              - row "Select Ali Adel Ali Adel Marketing Jul 12, 2026 09:00 17:00 0h Present View details for Ali Adel Edit Ali Adel Delete record for Ali Adel" [ref=e440] [cursor=pointer]:
                - cell "Select Ali Adel" [ref=e441]:
                  - checkbox "Select Ali Adel" [ref=e442]
                - cell "Ali Adel Marketing" [ref=e443]:
                  - paragraph [ref=e444]: Ali Adel
                  - paragraph [ref=e445]: Marketing
                - cell "Jul 12, 2026" [ref=e446]
                - cell "09:00" [ref=e447]
                - cell "17:00" [ref=e448]
                - cell "0h" [ref=e449]
                - cell "Present" [ref=e450]:
                  - generic [ref=e451]: Present
                - cell "View details for Ali Adel Edit Ali Adel Delete record for Ali Adel" [ref=e453]:
                  - generic [ref=e454]:
                    - button "View details for Ali Adel" [ref=e455]:
                      - img [ref=e456]
                    - button "Edit Ali Adel" [ref=e458]:
                      - img [ref=e459]
                    - button "Delete record for Ali Adel" [ref=e461]:
                      - img [ref=e462]
              - row "Select Youssef Ragheb Youssef Ragheb Engineering Jul 9, 2026 09:00 17:00 0h Present View details for Youssef Ragheb Edit Youssef Ragheb Delete record for Youssef Ragheb" [ref=e464] [cursor=pointer]:
                - cell "Select Youssef Ragheb" [ref=e465]:
                  - checkbox "Select Youssef Ragheb" [ref=e466]
                - cell "Youssef Ragheb Engineering" [ref=e467]:
                  - paragraph [ref=e468]: Youssef Ragheb
                  - paragraph [ref=e469]: Engineering
                - cell "Jul 9, 2026" [ref=e470]
                - cell "09:00" [ref=e471]
                - cell "17:00" [ref=e472]
                - cell "0h" [ref=e473]
                - cell "Present" [ref=e474]:
                  - generic [ref=e475]: Present
                - cell "View details for Youssef Ragheb Edit Youssef Ragheb Delete record for Youssef Ragheb" [ref=e477]:
                  - generic [ref=e478]:
                    - button "View details for Youssef Ragheb" [ref=e479]:
                      - img [ref=e480]
                    - button "Edit Youssef Ragheb" [ref=e482]:
                      - img [ref=e483]
                    - button "Delete record for Youssef Ragheb" [ref=e485]:
                      - img [ref=e486]
              - row "Select Ziad Ammar Ziad Ammar Sales Jul 9, 2026 09:00 17:00 0h Present View details for Ziad Ammar Edit Ziad Ammar Delete record for Ziad Ammar" [ref=e488] [cursor=pointer]:
                - cell "Select Ziad Ammar" [ref=e489]:
                  - checkbox "Select Ziad Ammar" [ref=e490]
                - cell "Ziad Ammar Sales" [ref=e491]:
                  - paragraph [ref=e492]: Ziad Ammar
                  - paragraph [ref=e493]: Sales
                - cell "Jul 9, 2026" [ref=e494]
                - cell "09:00" [ref=e495]
                - cell "17:00" [ref=e496]
                - cell "0h" [ref=e497]
                - cell "Present" [ref=e498]:
                  - generic [ref=e499]: Present
                - cell "View details for Ziad Ammar Edit Ziad Ammar Delete record for Ziad Ammar" [ref=e501]:
                  - generic [ref=e502]:
                    - button "View details for Ziad Ammar" [ref=e503]:
                      - img [ref=e504]
                    - button "Edit Ziad Ammar" [ref=e506]:
                      - img [ref=e507]
                    - button "Delete record for Ziad Ammar" [ref=e509]:
                      - img [ref=e510]
              - row "Select Eslam Adel Eslam Adel Finance Jul 9, 2026 09:00 17:00 0h Present View details for Eslam Adel Edit Eslam Adel Delete record for Eslam Adel" [ref=e512] [cursor=pointer]:
                - cell "Select Eslam Adel" [ref=e513]:
                  - checkbox "Select Eslam Adel" [ref=e514]
                - cell "Eslam Adel Finance" [ref=e515]:
                  - paragraph [ref=e516]: Eslam Adel
                  - paragraph [ref=e517]: Finance
                - cell "Jul 9, 2026" [ref=e518]
                - cell "09:00" [ref=e519]
                - cell "17:00" [ref=e520]
                - cell "0h" [ref=e521]
                - cell "Present" [ref=e522]:
                  - generic [ref=e523]: Present
                - cell "View details for Eslam Adel Edit Eslam Adel Delete record for Eslam Adel" [ref=e525]:
                  - generic [ref=e526]:
                    - button "View details for Eslam Adel" [ref=e527]:
                      - img [ref=e528]
                    - button "Edit Eslam Adel" [ref=e530]:
                      - img [ref=e531]
                    - button "Delete record for Eslam Adel" [ref=e533]:
                      - img [ref=e534]
              - row "Select Radwa Ramadan Radwa Ramadan Inventory Jul 9, 2026 09:00 17:00 0h Present View details for Radwa Ramadan Edit Radwa Ramadan Delete record for Radwa Ramadan" [ref=e536] [cursor=pointer]:
                - cell "Select Radwa Ramadan" [ref=e537]:
                  - checkbox "Select Radwa Ramadan" [ref=e538]
                - cell "Radwa Ramadan Inventory" [ref=e539]:
                  - paragraph [ref=e540]: Radwa Ramadan
                  - paragraph [ref=e541]: Inventory
                - cell "Jul 9, 2026" [ref=e542]
                - cell "09:00" [ref=e543]
                - cell "17:00" [ref=e544]
                - cell "0h" [ref=e545]
                - cell "Present" [ref=e546]:
                  - generic [ref=e547]: Present
                - cell "View details for Radwa Ramadan Edit Radwa Ramadan Delete record for Radwa Ramadan" [ref=e549]:
                  - generic [ref=e550]:
                    - button "View details for Radwa Ramadan" [ref=e551]:
                      - img [ref=e552]
                    - button "Edit Radwa Ramadan" [ref=e554]:
                      - img [ref=e555]
                    - button "Delete record for Radwa Ramadan" [ref=e557]:
                      - img [ref=e558]
              - row "Select Ali Adel Ali Adel Marketing Jul 9, 2026 09:00 17:00 0h Present View details for Ali Adel Edit Ali Adel Delete record for Ali Adel" [ref=e560] [cursor=pointer]:
                - cell "Select Ali Adel" [ref=e561]:
                  - checkbox "Select Ali Adel" [ref=e562]
                - cell "Ali Adel Marketing" [ref=e563]:
                  - paragraph [ref=e564]: Ali Adel
                  - paragraph [ref=e565]: Marketing
                - cell "Jul 9, 2026" [ref=e566]
                - cell "09:00" [ref=e567]
                - cell "17:00" [ref=e568]
                - cell "0h" [ref=e569]
                - cell "Present" [ref=e570]:
                  - generic [ref=e571]: Present
                - cell "View details for Ali Adel Edit Ali Adel Delete record for Ali Adel" [ref=e573]:
                  - generic [ref=e574]:
                    - button "View details for Ali Adel" [ref=e575]:
                      - img [ref=e576]
                    - button "Edit Ali Adel" [ref=e578]:
                      - img [ref=e579]
                    - button "Delete record for Ali Adel" [ref=e581]:
                      - img [ref=e582]
              - row "Select Hassan Emad Hassan Emad Hr Jul 9, 2026 09:00 17:00 0h Present View details for Hassan Emad Edit Hassan Emad Delete record for Hassan Emad" [ref=e584] [cursor=pointer]:
                - cell "Select Hassan Emad" [ref=e585]:
                  - checkbox "Select Hassan Emad" [ref=e586]
                - cell "Hassan Emad Hr" [ref=e587]:
                  - paragraph [ref=e588]: Hassan Emad
                  - paragraph [ref=e589]: Hr
                - cell "Jul 9, 2026" [ref=e590]
                - cell "09:00" [ref=e591]
                - cell "17:00" [ref=e592]
                - cell "0h" [ref=e593]
                - cell "Present" [ref=e594]:
                  - generic [ref=e595]: Present
                - cell "View details for Hassan Emad Edit Hassan Emad Delete record for Hassan Emad" [ref=e597]:
                  - generic [ref=e598]:
                    - button "View details for Hassan Emad" [ref=e599]:
                      - img [ref=e600]
                    - button "Edit Hassan Emad" [ref=e602]:
                      - img [ref=e603]
                    - button "Delete record for Hassan Emad" [ref=e605]:
                      - img [ref=e606]
              - row "Select Youssef Ragheb Youssef Ragheb Engineering Jul 8, 2026 09:00 17:00 0h Present View details for Youssef Ragheb Edit Youssef Ragheb Delete record for Youssef Ragheb" [ref=e608] [cursor=pointer]:
                - cell "Select Youssef Ragheb" [ref=e609]:
                  - checkbox "Select Youssef Ragheb" [ref=e610]
                - cell "Youssef Ragheb Engineering" [ref=e611]:
                  - paragraph [ref=e612]: Youssef Ragheb
                  - paragraph [ref=e613]: Engineering
                - cell "Jul 8, 2026" [ref=e614]
                - cell "09:00" [ref=e615]
                - cell "17:00" [ref=e616]
                - cell "0h" [ref=e617]
                - cell "Present" [ref=e618]:
                  - generic [ref=e619]: Present
                - cell "View details for Youssef Ragheb Edit Youssef Ragheb Delete record for Youssef Ragheb" [ref=e621]:
                  - generic [ref=e622]:
                    - button "View details for Youssef Ragheb" [ref=e623]:
                      - img [ref=e624]
                    - button "Edit Youssef Ragheb" [ref=e626]:
                      - img [ref=e627]
                    - button "Delete record for Youssef Ragheb" [ref=e629]:
                      - img [ref=e630]
              - row "Select Ziad Ammar Ziad Ammar Sales Jul 8, 2026 09:00 17:00 0h Present View details for Ziad Ammar Edit Ziad Ammar Delete record for Ziad Ammar" [ref=e632] [cursor=pointer]:
                - cell "Select Ziad Ammar" [ref=e633]:
                  - checkbox "Select Ziad Ammar" [ref=e634]
                - cell "Ziad Ammar Sales" [ref=e635]:
                  - paragraph [ref=e636]: Ziad Ammar
                  - paragraph [ref=e637]: Sales
                - cell "Jul 8, 2026" [ref=e638]
                - cell "09:00" [ref=e639]
                - cell "17:00" [ref=e640]
                - cell "0h" [ref=e641]
                - cell "Present" [ref=e642]:
                  - generic [ref=e643]: Present
                - cell "View details for Ziad Ammar Edit Ziad Ammar Delete record for Ziad Ammar" [ref=e645]:
                  - generic [ref=e646]:
                    - button "View details for Ziad Ammar" [ref=e647]:
                      - img [ref=e648]
                    - button "Edit Ziad Ammar" [ref=e650]:
                      - img [ref=e651]
                    - button "Delete record for Ziad Ammar" [ref=e653]:
                      - img [ref=e654]
        - generic [ref=e656]:
          - paragraph [ref=e657]: Showing 1–20 of 54
          - navigation "Pagination" [ref=e658]:
            - button "Previous page" [disabled] [ref=e659]:
              - img [ref=e660]
            - button "Page 1" [ref=e662]: "1"
            - button "Page 2" [ref=e663]: "2"
            - button "Page 3" [ref=e664]: "3"
            - button "Next page" [ref=e665]:
              - img [ref=e666]
```

# Test source

```ts
  64  | }
  65  | 
  66  | // ─── Suite ─────────────────────────────────────────────────────────────
  67  | 
  68  | test.describe('HR Workflow E2E', () => {
  69  | 
  70  |   test('Core HR workflow: Login → Employees → Attendance → Payroll → Top Performance', async ({ page }) => {
  71  | 
  72  |     // ══════════════════════════════════════════════════════════
  73  |     // 1. LOGIN
  74  |     // ══════════════════════════════════════════════════════════
  75  |     await test.step('1. Login', async () => {
  76  |       await login(page);
  77  |       console.log(`[PASS] Login — redirected to ${page.url()}`);
  78  |     });
  79  | 
  80  |     // ══════════════════════════════════════════════════════════
  81  |     // 2. EMPLOYEES PAGE
  82  |     // ══════════════════════════════════════════════════════════
  83  |     await test.step('2. Employees', async () => {
  84  |       await waitForPageReady(page);
  85  | 
  86  |       // Stats cards
  87  |       await expect(page.locator('text=Total Employees').first()).toBeVisible({ timeout: 5000 });
  88  |       console.log('  [PASS] Stats cards visible');
  89  | 
  90  |       // Table rows
  91  |       await page.waitForSelector('table tbody tr', { timeout: 8000 });
  92  |       const rowCount = await page.locator('table tbody tr').count();
  93  |       console.log(`  [PASS] Table has ${rowCount} employees`);
  94  | 
  95  |       // Key employees
  96  |       await expect(page.getByText('Ziad Ammar').first()).toBeVisible({ timeout: 3000 });
  97  |       await expect(page.getByText('Radwa Ramadan').first()).toBeVisible({ timeout: 3000 });
  98  |       console.log('  [PASS] Ziad Ammar & Radwa Ramadan visible');
  99  | 
  100 |       // Add an employee for testing
  101 |       await removeAllDialogs(page);
  102 |       await clickButton(page, 'Add Employee');
  103 |       await page.waitForSelector('#form-modal-title', { timeout: 5000 });
  104 |       await fillField(page, 'Full Name', 'E2E Test Employee');
  105 |       await fillField(page, 'Employee #', 'E2E-001');
  106 |       await fillField(page, 'Email', 'e2e-test-emp@example.com');
  107 |       await fillField(page, 'Salary', '5000');
  108 |       await fillField(page, 'Hire Date', '2026-07-01');
  109 |       await selectField(page, 'Department', 'engineering');
  110 |       await page.locator('[role="dialog"]').getByRole('button', { name: 'Add Employee' }).click({ force: true });
  111 |       await page.waitForTimeout(2000);
  112 |       await removeAllDialogs(page);
  113 |       await waitForPageReady(page);
  114 | 
  115 |       await expect(page.getByText('E2E Test Employee').first()).toBeVisible({ timeout: 5000 });
  116 |       console.log('  [PASS] Added new employee');
  117 |     });
  118 | 
  119 |     // ══════════════════════════════════════════════════════════
  120 |     // 3. ATTENDANCE + IMPORT
  121 |     // ══════════════════════════════════════════════════════════
  122 |     await test.step('3. Attendance', async () => {
  123 |       await removeAllDialogs(page);
  124 |       await page.getByRole('link', { name: 'Attendance' }).click({ force: true, timeout: 5000 });
  125 |       await page.waitForURL(/\/hr\/attendance/, { timeout: 10000 });
  126 |       await waitForPageReady(page);
  127 | 
  128 |       await expect(page.locator('text=Present').first()).toBeVisible({ timeout: 5000 });
  129 |       console.log('  [PASS] Stats cards visible');
  130 | 
  131 |       // Add attendance for Ziad Ammar (today)
  132 |       await removeAllDialogs(page);
  133 |       await clickButton(page, 'Add Record');
  134 |       await page.waitForSelector('#form-modal-title', { timeout: 5000 });
  135 |       await selectField(page, 'Employee', '4');
  136 |       await fillField(page, 'Date', new Date().toISOString().split('T')[0]);
  137 |       await fillField(page, 'Check In', '09:00');
  138 |       await fillField(page, 'Check Out', '17:00');
  139 |       await page.locator('[role="dialog"]').getByRole('button', { name: 'Add Record' }).click({ force: true });
  140 |       await page.waitForTimeout(2000);
  141 |       await removeAllDialogs(page);
  142 |       await waitForPageReady(page);
  143 | 
  144 |       await expect(page.getByText('Ziad Ammar').first()).toBeVisible({ timeout: 5000 });
  145 |       console.log('  [PASS] Attendance added for Ziad Ammar');
  146 | 
  147 |       // Test Import
  148 |       const importBtn = page.getByRole('button', { name: 'Import', exact: true });
  149 |       if (await importBtn.isVisible({ timeout: 2000 })) {
  150 |         await importBtn.click({ force: true });
  151 |         await page.waitForSelector('#import-modal-title', { timeout: 5000 });
  152 |         console.log('  [PASS] Import modal opened');
  153 | 
  154 |         // Create sample CSV
  155 |         const tmpDir = path.join(__dirname, '..', 'tmp');
  156 |         if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
  157 |         const csvPath = path.join(tmpDir, 'e2e-import.csv');
  158 |         fs.writeFileSync(csvPath, 'employee_id,attendance_date,status\n4,2026-07-15,present\n');
  159 | 
  160 |         await page.locator('input[type="file"]').setInputFiles(csvPath);
  161 |         await page.waitForTimeout(500);
  162 | 
  163 |         const importFileBtn = page.locator('[role="dialog"]').getByRole('button', { name: /^Import$/ });
> 164 |         if (await importFileBtn.isEnabled({ timeout: 3000 })) {
      |                                 ^ TimeoutError: locator.isEnabled: Timeout 3000ms exceeded.
  165 |           const respPromise = page.waitForResponse(r => r.url().includes('/attendance/import'), { timeout: 10000 });
  166 |           await importFileBtn.click();
  167 |           try {
  168 |             const resp = await respPromise;
  169 |             let body;
  170 |             try { body = await resp.json(); } catch { body = await resp.text(); }
  171 |             if (resp.status() >= 400) {
  172 |               console.log(`  [FAIL] Import API error: HTTP ${resp.status()} ${JSON.stringify(body)}`);
  173 |             } else {
  174 |               console.log(`  [PASS] Import succeeded: ${JSON.stringify(body)}`);
  175 |             }
  176 |           } catch (e) {
  177 |             console.log(`  [FAIL] Import request failed: ${e.message}`);
  178 |           }
  179 |         }
  180 |         const doneBtn = page.locator('[role="dialog"]').getByRole('button', { name: 'Done' });
  181 |         if (await doneBtn.isVisible({ timeout: 2000 })) {
  182 |           await doneBtn.click();
  183 |         }
  184 |         await removeAllDialogs(page);
  185 |       }
  186 |     });
  187 | 
  188 |     // ══════════════════════════════════════════════════════════
  189 |     // 4. PAYROLL GENERATION
  190 |     // ══════════════════════════════════════════════════════════
  191 |     await test.step('4. Payroll', async () => {
  192 |       await removeAllDialogs(page);
  193 |       await page.getByRole('link', { name: 'Payroll' }).click({ force: true, timeout: 5000 });
  194 |       await page.waitForURL(/\/hr\/payroll/, { timeout: 10000 });
  195 |       await waitForPageReady(page);
  196 | 
  197 |       await expect(page.locator('text=Total Payroll').first()).toBeVisible({ timeout: 5000 });
  198 |       console.log('  [PASS] Stats cards visible');
  199 | 
  200 |       // Open Generate Payroll modal
  201 |       await removeAllDialogs(page);
  202 |       await clickButton(page, 'Generate Payroll');
  203 |       await page.waitForSelector('#generate-payroll-title', { timeout: 5000 });
  204 | 
  205 |       // Click Generate and capture the API response
  206 |       const genRespPromise = page.waitForResponse(r => r.url().includes('/payroll/generate'), { timeout: 20000 });
  207 |       await page.locator('[role="dialog"]').getByRole('button', { name: 'Generate' }).click({ force: true });
  208 | 
  209 |       try {
  210 |         const genResp = await genRespPromise;
  211 |         let body;
  212 |         try { body = await genResp.json(); } catch { body = await genResp.text(); }
  213 | 
  214 |         if (genResp.status() >= 200 && genResp.status() < 300) {
  215 |           const count = Array.isArray(body) ? body.length : '?';
  216 |           console.log(`  [PASS] Payroll generated — ${count} records`);
  217 |         } else if (genResp.status() === 404) {
  218 |           const detail = body?.detail || JSON.stringify(body);
  219 |           console.log(`  [WARN] Payroll returned 404: ${detail}`);
  220 |         } else {
  221 |           console.log(`  [WARN] Payroll response: HTTP ${genResp.status()} ${JSON.stringify(body)}`);
  222 |         }
  223 |       } catch (e) {
  224 |         console.log(`  [WARN] Payroll request: ${e.message}`);
  225 |       }
  226 | 
  227 |       // Close modal
  228 |       await removeAllDialogs(page);
  229 |       await page.waitForTimeout(1000);
  230 |       await waitForPageReady(page);
  231 | 
  232 |       // Check table for records
  233 |       const table = page.locator('[aria-label="Payroll table"]').first();
  234 |       if (await table.isVisible({ timeout: 3000 })) {
  235 |         const rows = await table.locator('tbody tr').count();
  236 |         console.log(`  [INFO] Payroll table has ${rows} rows`);
  237 |       } else {
  238 |         console.log('  [INFO] No payroll table visible (generation may not have created records)');
  239 |       }
  240 |     });
  241 | 
  242 |     // ══════════════════════════════════════════════════════════
  243 |     // 5. TOP PERFORMANCE
  244 |     // ══════════════════════════════════════════════════════════
  245 |     await test.step('5. Top Performance', async () => {
  246 |       await removeAllDialogs(page);
  247 |       await page.getByRole('link', { name: 'Top Performance' }).click({ force: true, timeout: 5000 });
  248 |       await page.waitForURL(/\/hr\/top-performance/, { timeout: 10000 });
  249 |       await waitForPageReady(page);
  250 | 
  251 |       // Capture API response
  252 |       let apiStatus = 'unknown';
  253 |       let apiBody = null;
  254 |       try {
  255 |         const resp = await page.waitForResponse(r => r.url().includes('/top-performance'), { timeout: 15000 });
  256 |         apiStatus = String(resp.status());
  257 |         try { apiBody = await resp.json(); } catch { apiBody = await resp.text(); }
  258 |         if (resp.status() >= 400) {
  259 |           console.log(`  [FAIL] Top Performance API: HTTP ${resp.status()} ${JSON.stringify(apiBody)}`);
  260 |         } else {
  261 |           console.log(`  [PASS] API response: HTTP ${resp.status()}`);
  262 |         }
  263 |       } catch (e) {
  264 |         console.log(`  [FAIL] Top Performance API timed out: ${e.message}`);
```