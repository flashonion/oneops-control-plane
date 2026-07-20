# OneOps Demo Video Script

Target length: 73 seconds  
Format: 1280x720, H.264 MP4, English on-screen captions

## English voice-over

OneOps gives IT teams one operational view across every system.

The Live Workplace starts with the physical office. At a glance, an operator can
see who is at each desk, which computer they are using, how long they have been
online, and whether the device needs attention.

Selecting Mia at desk A-04 opens one reconciled device record. Intune compliance,
Atera agent data, ScreenConnect presence, and internal network inventory remain
traceable to their source.

Her urgent BitLocker request is already linked to the affected computer, giving
the service desk the context it needs without four separate logins.

OneOps is designed for parent companies and subsidiaries. Switching scope changes
the office, people, devices, and tickets together.

Connector health stays visible, while credentials stay on the server. When two
provider records cannot be matched safely, a human reviews the evidence before
they are merged.

The same context remains available on mobile, with read-only boundaries around
sensitive actions until authentication and auditing are configured.

OneOps. See the office as it is. Run IT as one system.

## Chinese voice-over reference

OneOps 为 IT 团队提供跨平台的一体化运营视图。

Live Workplace 从真实办公室开始。管理员可以直接看到每个工位是谁、正在使用
哪台电脑、在线多久，以及设备是否存在风险。

点击 A-04 的 Mia，就会打开一条统一设备记录。Intune 合规、Atera Agent、
ScreenConnect 在线状态和内部网络信息都保留各自的数据来源。

她的 BitLocker 紧急工单已经与受影响电脑关联，Service Desk 不需要再登录四个
平台才能获得完整上下文。

OneOps 同时支持母公司和子公司。切换管理范围时，办公室、员工、设备和工单会
一起更新。

连接器状态保持可见，但凭据只留在服务器端。无法安全确认的跨平台记录会进入
人工审核，而不是被系统盲目合并。

同样的信息也能在手机上使用。远程控制等敏感操作在身份验证和审计完成之前，
保持安全的只读边界。

OneOps，看见办公室的真实状态，让 IT 像一个系统一样运行。

## Regenerate

Capture the seven source images into `demo-captures`, then render the captioned
video:

```powershell
$env:PYTHONPATH='.video-tools'
python scripts/render_demo_video.py
```

On Windows, generate the local English narration and mux it into the video:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
& .\scripts\render_demo_narration.ps1
```

Outputs:

- `artifacts/oneops-hackathon-demo-v1.1.1.mp4`
- `artifacts/oneops-hackathon-demo-v1.1.1-narrated.mp4`

## OpenAI Build Week cut

The submission-specific cut is 98 seconds and adds an explicit narrated account
of how Codex and GPT-5.6 were used. Render it with:

```powershell
$env:PYTHONPATH='.video-tools'
python scripts/render_demo_video.py --build-week
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
& .\scripts\render_build_week_narration.ps1
```

The final upload file is
`artifacts/oneops-openai-build-week-demo-narrated.mp4`.
