import React from 'react';
import { ProtocolsBreakdown } from '../types';

interface ProtocolProps {
  protocols: ProtocolsBreakdown | undefined;
}

export const ProtocolDistribution: React.FC<ProtocolProps> = ({ protocols }) => {
  const tcp = protocols?.TCP || 0;
  const udp = protocols?.UDP || 0;
  const icmp = protocols?.ICMP || 0;
  const other = protocols?.OTHER || 0;
  const total = Math.max(1, tcp + udp + icmp + other);

  const tcpPct = ((tcp / total) * 100).toFixed(1);
  const udpPct = ((udp / total) * 100).toFixed(1);
  const icmpPct = ((icmp / total) * 100).toFixed(1);
  const otherPct = ((other / total) * 100).toFixed(1);

  return (
    <div className="p-5 rounded-xl bg-defense-card border border-defense-border">
      <h3 className="text-sm font-bold font-mono tracking-wider text-slate-100 mb-1 flex items-center justify-between">
        <span>DISTRIBUSI PROTOKOL</span>
        <span className="text-xs text-slate-400 font-normal">Real-Time Ratio</span>
      </h3>
      <p className="text-xs text-slate-400 font-mono mb-4">
        Komposisi paket data lapisan transport yang melintasi jaringan
      </p>

      <div className="space-y-3.5 font-mono text-xs">
        {/* TCP */}
        <div>
          <div className="flex justify-between text-slate-300 mb-1">
            <span className="font-semibold text-emerald-400">TCP (Transmission Control)</span>
            <span>{tcp} pkts ({tcpPct}%)</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div 
              className="h-full bg-emerald-500 rounded-full transition-all duration-300" 
              style={{ width: `${tcpPct}%` }}
            />
          </div>
        </div>

        {/* UDP */}
        <div>
          <div className="flex justify-between text-slate-300 mb-1">
            <span className="font-semibold text-blue-400">UDP (User Datagram)</span>
            <span>{udp} pkts ({udpPct}%)</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div 
              className="h-full bg-blue-500 rounded-full transition-all duration-300" 
              style={{ width: `${udpPct}%` }}
            />
          </div>
        </div>

        {/* ICMP */}
        <div>
          <div className="flex justify-between text-slate-300 mb-1">
            <span className={`font-semibold ${icmp > 50 ? 'text-red-400' : 'text-amber-400'}`}>
              ICMP (Ping / Echo Control)
            </span>
            <span className={icmp > 50 ? 'text-red-400 font-bold' : ''}>
              {icmp} pkts ({icmpPct}%)
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-300 ${icmp > 50 ? 'bg-red-500' : 'bg-amber-500'}`} 
              style={{ width: `${icmpPct}%` }}
            />
          </div>
        </div>

        {/* Other */}
        <div>
          <div className="flex justify-between text-slate-400 mb-1">
            <span>OTHER / ARP / RAW</span>
            <span>{other} pkts ({otherPct}%)</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div 
              className="h-full bg-purple-500 rounded-full transition-all duration-300" 
              style={{ width: `${otherPct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
