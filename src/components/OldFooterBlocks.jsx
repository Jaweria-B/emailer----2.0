const OldFooterBlocks = () => {
  return (

        <div className="grid lg:grid-cols-3 gap-12 mb-16">
          {/* Brand & Introduction */}
          <div className="lg:col-span-1">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-xl">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">AI Solutions</h3>
              </div>
              <p className="text-purple-200 leading-relaxed mb-6">
                Transforming businesses with intelligent automation and AI-powered solutions. 
                From smart email crafting to comprehensive workflow automation.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {stats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <div 
                    key={stat.label}
                    className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <IconComponent className="h-4 w-4 text-purple-300" />
                      <span className="text-2xl font-bold text-white">{stat.value}</span>
                    </div>
                    <p className="text-xs text-purple-200">{stat.label}</p>
                  </div>
                );
              })}
            </div>

            {/* Connect Links */}
            <div className="space-y-3">
              <a
                href="https://uinfo.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 text-purple-200 hover:text-white transition-all duration-300"
              >
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <Globe className="h-4 w-4 text-white" />
                </div>
                <span className="group-hover:translate-x-1 transition-transform duration-300">Visit uinfo.org Platform</span>
                <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all duration-300" />
              </a>
              
              <a
                href="https://www.linkedin.com/company/uinfo/"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 text-purple-200 hover:text-white transition-all duration-300"
              >
                <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-2 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <Linkedin className="h-4 w-4 text-white" />
                </div>
                <span className="group-hover:translate-x-1 transition-transform duration-300">Follow uinfo on LinkedIn</span>
                <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all duration-300" />
              </a>
            </div>
          </div>

          {/* Services Showcase */}
          <div className="lg:col-span-2">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-white mb-2">Explore Our AI Services</h3>
              <p className="text-purple-200">Discover how our intelligent solutions can transform your workflow</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {services.map((service, index) => {
                const IconComponent = service.icon;
                const isHovered = hoveredService === service.id;
                
                return (
                  <div
                    key={service.id}
                    className={`group relative bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-500 cursor-pointer transform hover:scale-105 hover:shadow-2xl ${
                      isHovered ? 'ring-2 ring-purple-400' : ''
                    }`}
                    onMouseEnter={() => setHoveredService(service.id)}
                    onMouseLeave={() => setHoveredService(null)}
                    style={{ animationDelay: `${index * 0.2}s` }}
                  >
                    {/* Gradient Background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-2xl`} />
                    
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`bg-gradient-to-r ${service.gradient} p-3 rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                          <IconComponent className="h-5 w-5 text-white" />
                        </div>
                        <h4 className="text-lg font-semibold text-white group-hover:text-purple-200 transition-colors duration-300">
                          {service.title}
                        </h4>
                      </div>
                      
                      <p className="text-purple-200 mb-4 group-hover:text-white transition-colors duration-300">
                        {service.description}
                      </p>
                      
                      <div className="space-y-2 mb-4">
                        {service.features.map((feature, featureIndex) => (
                          <div 
                            key={feature}
                            className="flex items-center gap-2 text-sm text-purple-300 group-hover:text-purple-200 transition-all duration-300"
                            style={{ 
                              opacity: isHovered ? 1 : 0.7,
                              transform: isHovered ? 'translateX(0)' : 'translateX(-10px)',
                              transitionDelay: `${featureIndex * 0.1}s`
                            }}
                          >
                            <ChevronRight className="h-3 w-3" />
                            {feature}
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex items-center gap-2 text-purple-300 group-hover:text-white transition-all duration-300">
                        <span className="text-sm font-medium">Learn More</span>
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
  )
}

export default OldFooterBlocks;