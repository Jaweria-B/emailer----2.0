// // src/components/ProviderSelector.js
// import React from 'react';
// import { Bot, Brain, Sparkles, Zap } from 'lucide-react';
// import { AI_PROVIDERS, AI_PROVIDER_INFO } from '../lib/ai-config';

// const ProviderSelector = ({ selectedProvider, onProviderChange }) => {
//   const providers = [
//     { 
//       value: AI_PROVIDERS.GEMINI, 
//       icon: Bot, 
//       color: 'from-orange-500 to-red-500',
//       bgColor: 'bg-orange-500/20'
//     }
//   ];

//   return (
//     <div className="mb-6">
//       <label className="block text-purple-100 text-sm font-medium mb-3">
//         Select AI Provider
//       </label>
//       <div className="grid grid-cols-2 gap-3">
//         {providers.map((provider) => {
//           const IconComponent = provider.icon;
//           const isSelected = selectedProvider === provider.value;
//           const providerInfo = AI_PROVIDER_INFO[provider.value];
          
//           return (
//             <button
//               key={provider.value}
//               onClick={() => onProviderChange(provider.value)}
//               className={`p-4 rounded-xl border transition-all duration-300 flex flex-col items-center gap-2 ${
//                 isSelected
//                   ? `${provider.bgColor} border-white/30 text-white`
//                   : 'bg-white/10 border-white/20 text-purple-100 hover:bg-white/20'
//               }`}
//             >
//               <div className={`p-2 rounded-lg bg-gradient-to-r ${provider.color}`}>
//                 <IconComponent className="h-5 w-5 text-white" />
//               </div>
//               <div className="text-center">
//                 <div className="text-sm font-semibold">{providerInfo.name}</div>
//                 <div className="text-xs opacity-75">{providerInfo.description}</div>
//               </div>
//             </button>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// export default ProviderSelector;