import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { trend } from '../data'

export default function HealthChart() {
  return <>
    <div className="chart-wrap">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={trend} margin={{ top: 10, right: 8, left: -28, bottom: 0 }}>
          <defs>
            <linearGradient id="complianceFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity={0.18}/>
              <stop offset="100%" stopColor="#2563eb" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="#e9edf1" />
          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#76808c', fontSize: 12 }} />
          <YAxis domain={[75, 100]} axisLine={false} tickLine={false} tick={{ fill: '#929aa4', fontSize: 11 }} />
          <Tooltip contentStyle={{ border: '1px solid #dde2e8', borderRadius: 6, boxShadow: '0 8px 24px rgba(20,32,50,.1)' }} />
          <Area type="monotone" dataKey="compliant" stroke="#2563eb" strokeWidth={2.5} fill="url(#complianceFill)" />
          <Area type="monotone" dataKey="online" stroke="#13a16d" strokeWidth={2} fill="transparent" strokeDasharray="5 4" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
    <div className="chart-legend"><span><i className="legend-blue" />Compliance</span><span><i className="legend-green" />Online</span><span className="chart-note">7-day average</span></div>
  </>
}
