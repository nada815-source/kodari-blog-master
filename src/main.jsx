import React from 'react'
import ReactDOM from 'react-dom/client'
import AppV3 from './App.jsx'
import AppV2 from './AppV2.jsx'
import './index.css'

// 🐟 부장님표 수제 멀티 라우터 (URL에 따라 V2/V3 전환)
const path = window.location.pathname;
const CurrentApp = path === '/v2' ? AppV2 : AppV3;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CurrentApp />
  </React.StrictMode>,
)
