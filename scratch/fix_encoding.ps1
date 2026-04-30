$content = Get-Content src/App.jsx
[IO.File]::WriteAllLines('src/App.jsx', $content, (New-Object System.Text.UTF8Encoding($false)))
