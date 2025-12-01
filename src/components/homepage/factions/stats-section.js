
import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Mail, Zap, Users, TrendingUp, ArrowRight, 
  CheckCircle, Clock, Shield, Target, Globe, Send, 
  BarChart, Star, Briefcase, GraduationCap, Megaphone, Building
} from 'lucide-react';
import Button from "@/components/button"; 
import LinkButton from '@/components/linkButton';

// Stats Section
const StatsSection = () => {
  const [stats, setStats] = useState({ emails: 60, users: 500, timeSaved: 2500, satisfaction: 98 });

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => setStats(prev => ({ ...prev, emails: data.emailsGenerated || prev.emails })))
      .catch(() => {});
  }, []);

  return (
    <section className="py-20 text-white" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)' }}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Trusted by Thousands Worldwide</h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">Join the community transforming their email communication</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
          <div className="text-center">
            <div className="text-5xl md:text-6xl font-bold mb-2">{stats.emails.toLocaleString()}+</div>
            <div className="text-lg opacity-90">Emails Generated</div>
          </div>
          <div className="text-center">
            <div className="text-5xl md:text-6xl font-bold mb-2">{stats.users.toLocaleString()}+</div>
            <div className="text-lg opacity-90">Happy Users</div>
          </div>
          <div className="text-center">
            <div className="text-5xl md:text-6xl font-bold mb-2">{stats.timeSaved.toLocaleString()}+</div>
            <div className="text-lg opacity-90">Hours Saved</div>
          </div>
          <div className="text-center">
            <div className="text-5xl md:text-6xl font-bold mb-2">{stats.satisfaction}%</div>
            <div className="text-lg opacity-90">Satisfaction Rate</div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default StatsSection;