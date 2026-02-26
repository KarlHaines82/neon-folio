import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Terminal, 
  User, 
  Code, 
  Briefcase, 
  Mail, 
  Github, 
  ExternalLink, 
  Cpu, 
  Globe, 
  Layers,
  MessageSquare,
  Download,
  Search,
  Menu,
  X,
  LogIn,
  LogOut
} from 'lucide-react';
import Markdown from 'react-markdown';

// --- Types ---
interface User {
  id: string;
  username: string;
  avatar_url: string;
  role: string;
}

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string;
  created_at: string;
}

interface Service {
  id: string;
  name: string;
  description: string;
  pricing: string;
  image: string;
}

interface Skill {
  id: number;
  name: string;
  level: number;
  category: string;
}

interface Experience {
  id: number;
  company: string;
  position: string;
  duration: string;
  description: string;
}

// --- Components ---

const Navbar = ({ user, onLogin }: { user: User | null, onLogin: (provider: 'google' | 'github') => void }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-cyber-black/40 backdrop-blur-xl border-b border-white/10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2 text-cyber-pink font-bold text-2xl tracking-tighter">
          <Terminal size={28} />
          <span className="glitch-text">NEON_PORTFOLIO v1.0</span>
        </div>

        <div className="hidden md:flex items-center gap-6">
          {['Bio', 'Skills', 'Services', 'Blog', 'Contact'].map((item) => (
            <a 
              key={item} 
              href={`#${item.toLowerCase()}`} 
              className="cyber-nav-link"
            >
              {item}
            </a>
          ))}
          {user ? (
            <div className="flex items-center gap-3 border-l border-white/10 pl-6">
              <img src={user.avatar_url} alt={user.username} className="w-10 h-10 rounded-full border-2 border-cyber-pink" />
              <span className="text-sm font-bold text-cyber-pink uppercase">{user.username}</span>
              <button onClick={() => fetch('/api/logout').then(() => window.location.reload())} className="text-gray-500 hover:text-red-500 transition-colors">
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <button onClick={() => onLogin('github')} className="cyber-nav-link flex items-center gap-2">
                <Github size={16} /> LOGIN
              </button>
            </div>
          )}
        </div>

        <button className="md:hidden text-cyber-pink" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={32} /> : <Menu size={32} />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-cyber-black/90 backdrop-blur-2xl border-b border-white/10 p-6 flex flex-col gap-4 relative z-50"
          >
            {['Bio', 'Skills', 'Services', 'Blog', 'Contact'].map((item) => (
              <a 
                key={item} 
                href={`#${item.toLowerCase()}`} 
                onClick={() => setIsOpen(false)}
                className="cyber-nav-link text-center py-3"
              >
                {item}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Section = ({ id, title, children, className = "" }: { id: string, title: string, children: React.ReactNode, className?: string }) => (
  <section id={id} className={`py-24 px-4 relative ${className}`}>
    <div className="max-w-7xl mx-auto relative z-10">
      <div className="flex items-center gap-4 mb-12">
        <h2 className="text-4xl md:text-6xl text-cyber-cyan">{title}</h2>
        <div className="h-px flex-grow bg-cyber-cyan/20" />
        <span className="text-xs text-cyber-cyan/50 font-mono">SEC_0{id.toUpperCase()}</span>
      </div>
      <div className="cyber-glass p-8 md:p-12 rounded-2xl border border-white/5">
        {children}
      </div>
    </div>
  </section>
);

const SkillCard = ({ skill }: { skill: Skill }) => (
  <div className="cyber-border-pink p-6 bg-cyber-pink/5 group hover:bg-cyber-pink/10 transition-all">
    <div className="flex justify-between items-end mb-4">
      <span className="text-xl font-bold text-white group-hover:text-cyber-pink transition-colors">{skill.name}</span>
      <span className="text-cyber-pink text-xs">{skill.level}%</span>
    </div>
    <div className="h-1 w-full bg-gray-800 overflow-hidden">
      <motion.div 
        initial={{ width: 0 }}
        whileInView={{ width: `${skill.level}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="h-full bg-cyber-pink shadow-[0_0_10px_rgba(255,0,255,0.8)]"
      />
    </div>
    <span className="mt-2 block text-[10px] uppercase text-cyber-pink/40 tracking-widest">{skill.category}</span>
  </div>
);

const ServiceCard = ({ service }: { service: Service }) => (
  <div className="cyber-border-yellow overflow-hidden group bg-cyber-yellow/5">
    <div className="relative h-48 overflow-hidden">
      <img 
        src={service.image} 
        alt={service.name} 
        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-110 group-hover:scale-100"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-cyber-black to-transparent" />
      <div className="absolute bottom-4 left-4">
        <span className="bg-cyber-yellow text-black px-2 py-0.5 text-[10px] font-bold uppercase">{service.pricing}</span>
      </div>
    </div>
    <div className="p-6">
      <h3 className="text-xl mb-2 text-white group-hover:text-cyber-yellow transition-colors">{service.name}</h3>
      <p className="text-sm text-gray-400 leading-relaxed">{service.description}</p>
      <button className="mt-6 text-cyber-yellow text-xs uppercase tracking-widest flex items-center gap-2 hover:gap-4 transition-all">
        Request Intel <ExternalLink size={14} />
      </button>
    </div>
  </div>
);

const BlogPostCard = ({ post }: { post: BlogPost }) => (
  <motion.div 
    whileHover={{ x: 10 }}
    className="relative border-b border-white/10 py-8 group cursor-pointer overflow-hidden"
  >
    {/* Animated Background Gradient */}
    <div className="absolute inset-0 bg-gradient-to-r from-cyber-purple/0 via-cyber-purple/5 to-cyber-purple/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
    
    <div className="relative flex flex-col md:flex-row gap-6 z-10">
      <div className="md:w-1/4">
        <span className="text-xs text-cyber-purple/40 font-mono group-hover:text-cyber-purple/80 transition-colors">
          [{new Date(post.created_at).toLocaleDateString()}]
        </span>
        <div className="mt-4 flex flex-wrap gap-2">
          {post.tags.split(',').map(tag => (
            <span key={tag} className="text-[9px] border border-cyber-purple/20 px-2 py-0.5 text-cyber-purple/40 uppercase group-hover:border-cyber-purple/60 group-hover:text-cyber-purple transition-all">
              #{tag}
            </span>
          ))}
        </div>
      </div>
      <div className="md:w-3/4">
        <h3 className="text-2xl mb-3 text-white group-hover:text-cyber-purple group-hover:neon-glow-purple-strong transition-all duration-300 uppercase tracking-tighter">
          {post.title}
        </h3>
        <p className="text-gray-500 text-sm line-clamp-2 mb-6 group-hover:text-gray-300 group-hover:neon-glow-purple transition-all duration-300 leading-relaxed">
          {post.excerpt}
        </p>
        <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.2em] text-cyber-purple/60 group-hover:text-cyber-purple transition-all">
          <span className="font-bold">Access_Data_Stream</span>
          <div className="h-[1px] w-12 bg-cyber-purple/30 group-hover:w-24 group-hover:bg-cyber-purple transition-all duration-500" />
          <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all" />
        </div>
      </div>
    </div>
  </motion.div>
);

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [githubStats, setGithubStats] = useState<any>(null);

  useEffect(() => {
    fetch('/api/me').then(res => res.json()).then(setUser);
    fetch('/api/posts').then(res => res.json()).then(setPosts);
    fetch('/api/services').then(res => res.json()).then(setServices);
    fetch('/api/skills').then(res => res.json()).then(setSkills);
    fetch('/api/experience').then(res => res.json()).then(setExperience);
    
    setGithubStats({
      repos: 42,
      contributions: 1337,
      languages: ['TypeScript', 'Rust', 'Go', 'Python'],
      streak: 15
    });
  }, []);

  const handleLogin = (provider: 'google' | 'github') => {
    const width = 600, height = 700;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;
    window.open(`/auth/${provider}`, 'oauth_popup', `width=${width},height=${height},left=${left},top=${top}`);
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        fetch('/api/me').then(res => res.json()).then(setUser);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Neon Dev",
    "jobTitle": "Senior Systems Architect",
    "url": window.location.origin,
    "sameAs": [
      "https://github.com/neon_dev",
      "https://twitter.com/neon_dev"
    ]
  };

  return (
    <div className="min-h-screen">
      <script type="application/ld+json">
        {JSON.stringify(schemaData)}
      </script>
      
      {/* Configuration Warning */}
      {!user && (
        <div className="fixed bottom-4 right-4 z-[100] max-w-xs">
          <div className="cyber-border bg-cyber-black/90 p-4 text-[10px] text-cyber-yellow uppercase tracking-widest">
            <div className="flex items-center gap-2 mb-2">
              <Terminal size={14} /> SYSTEM_NOTICE
            </div>
            OAuth credentials not detected. Social login features are currently offline. Configure secrets in AI Studio to enable.
          </div>
        </div>
      )}

      <Navbar user={user} onLogin={handleLogin} />

      {/* Hero Section */}
      <section className="h-screen flex flex-col justify-center px-4 max-w-7xl mx-auto relative overflow-hidden">
          <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="z-10 cyber-glass p-12 rounded-3xl border border-white/10"
        >
          <span className="text-cyber-pink font-mono mb-4 block tracking-[0.5em] text-sm">INITIALIZING_SYSTEM...</span>
          <h1 className="text-6xl md:text-9xl mb-6 leading-none text-cyber-cyan">
            I BUILD <br />
            <span className="text-cyber-pink">DIGITAL</span> <br />
            FRONTIERS
          </h1>
          <p className="max-w-xl text-gray-400 text-lg md:text-xl mb-10 leading-relaxed">
            Senior Systems Architect & Full-Stack Engineer specializing in high-performance distributed systems and immersive web experiences.
          </p>
          <div className="flex flex-wrap gap-6">
            <a 
              href="/resume.pdf" 
              download 
              className="cyber-button-pink flex items-center gap-2"
            >
              Download_Resume.pdf <Download size={18} />
            </a>
            <a 
              href="#services"
              className="text-cyber-cyan uppercase tracking-widest text-sm flex items-center gap-2 hover:gap-4 transition-all"
            >
              View_Services <Briefcase size={18} />
            </a>
          </div>
        </motion.div>

        {/* Background Decorative Elements */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none hidden lg:block">
          <Terminal size={600} className="text-cyber-green" />
        </div>
      </section>

      {/* Bio Section */}
      <Section id="bio" title="The_Entity">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="cyber-border p-2">
              <img 
                src="https://picsum.photos/seed/hacker/800/1000" 
                alt="Profile" 
                className="w-full grayscale hover:grayscale-0 transition-all duration-700"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 cyber-border bg-cyber-black flex items-center justify-center p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-cyber-green">10+</div>
                <div className="text-[10px] uppercase text-gray-500">Years_XP</div>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-3xl mb-6 text-cyber-pink">NARRATIVE_ARCHIVE</h3>
            <p className="text-gray-400 leading-relaxed mb-8">
              Born in the silicon valleys of the old world, I've spent the last decade navigating the complex architectures of the modern web. My mission is to bridge the gap between human intuition and machine precision.
            </p>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h4 className="text-sm mb-4 text-cyber-yellow">CORE_DIRECTIVES</h4>
                <ul className="text-xs space-y-2 text-gray-500 uppercase tracking-wider">
                  <li>• Performance_Optimization</li>
                  <li>• Scalable_Architecture</li>
                  <li>• Security_Hardening</li>
                  <li>• UX_Immersion</li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm mb-4 text-cyber-yellow">CURRENT_LOCATION</h4>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Neo-Tokyo, Sector 7 <br /> (Remote_Enabled)</p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Skills & GitHub Section */}
      <Section id="skills" title="Arsenal">
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 grid md:grid-cols-2 gap-6">
            {skills.map(skill => <SkillCard key={skill.id} skill={skill} />)}
          </div>
          <div className="cyber-border-yellow p-8 bg-cyber-yellow/5">
            <h3 className="text-xl mb-6 flex items-center gap-2 text-cyber-yellow">
              <Github size={20} /> GITHUB_METRICS
            </h3>
            {githubStats && (
              <div className="space-y-8">
                <div className="flex justify-between items-center border-b border-cyber-yellow/10 pb-4">
                  <span className="text-xs text-gray-500 uppercase">Repositories</span>
                  <span className="text-2xl font-bold text-cyber-yellow">{githubStats.repos}</span>
                </div>
                <div className="flex justify-between items-center border-b border-cyber-yellow/10 pb-4">
                  <span className="text-xs text-gray-500 uppercase">Contributions</span>
                  <span className="text-2xl font-bold text-cyber-yellow">{githubStats.contributions}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase block mb-4">Top_Languages</span>
                  <div className="flex flex-wrap gap-2">
                    {githubStats.languages.map((lang: string) => (
                      <span key={lang} className="text-[10px] bg-cyber-yellow/10 text-cyber-yellow border border-cyber-yellow/30 px-2 py-1 uppercase">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="pt-4">
                  <div className="h-24 w-full bg-cyber-yellow/5 border border-cyber-yellow/10 flex items-end gap-1 p-2">
                    {[...Array(20)].map((_, i) => (
                      <div 
                        key={i} 
                        className="flex-grow bg-cyber-yellow/40 hover:bg-cyber-yellow transition-colors" 
                        style={{ height: `${Math.random() * 100}%` }}
                      />
                    ))}
                  </div>
                  <span className="text-[8px] text-gray-600 uppercase mt-2 block">CONTRIBUTION_GRAPH_SIMULATION</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </Section>

      {/* Services Section */}
      <Section id="services" title="Operations">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map(service => <ServiceCard key={service.id} service={service} />)}
        </div>
      </Section>

      {/* Blog Section */}
      <Section id="blog" title="Data_Logs">
        <div className="max-w-4xl">
          {posts.map(post => <BlogPostCard key={post.id} post={post} />)}
          <button className="mt-12 cyber-button w-full md:w-auto">View_All_Logs</button>
        </div>
      </Section>

      {/* Contact Section */}
      <Section id="contact" title="Uplink">
        <div className="grid md:grid-cols-2 gap-16">
          <div>
            <h3 className="text-3xl mb-6 text-cyber-pink">ESTABLISH_CONNECTION</h3>
            <p className="text-gray-400 mb-10">
              Have a project that requires high-level technical intervention? Send an encrypted message through the terminal.
            </p>
            <div className="space-y-6">
              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 cyber-border-pink flex items-center justify-center text-cyber-pink group-hover:bg-cyber-pink group-hover:text-white transition-all">
                  <Mail size={20} />
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 uppercase">Email</div>
                  <div className="text-white">kmhnashville@gmail.com</div>
                </div>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 cyber-border-yellow flex items-center justify-center text-cyber-yellow group-hover:bg-cyber-yellow group-hover:text-black transition-all">
                  <Globe size={20} />
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 uppercase">Network</div>
                  <div className="text-white">github.com/neon_dev</div>
                </div>
              </div>
            </div>
          </div>
          <form className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase text-cyber-green">Identity</label>
                <input type="text" className="w-full bg-cyber-green/5 border border-cyber-green/20 p-3 text-white focus:border-cyber-green outline-none transition-all" placeholder="USER_NAME" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase text-cyber-green">Uplink_Address</label>
                <input type="email" className="w-full bg-cyber-green/5 border border-cyber-green/20 p-3 text-white focus:border-cyber-green outline-none transition-all" placeholder="EMAIL@DOMAIN.COM" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase text-cyber-green">Payload</label>
              <textarea rows={5} className="w-full bg-cyber-green/5 border border-cyber-green/20 p-3 text-white focus:border-cyber-green outline-none transition-all" placeholder="MESSAGE_CONTENT..." />
            </div>
            <button type="submit" className="cyber-button w-full">Transmit_Message</button>
          </form>
        </div>
      </Section>

      {/* Footer */}
      <footer className="py-12 border-t border-cyber-green/10 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-[10px] text-gray-500 uppercase tracking-[0.3em]">
            © 2026 NEON_PORTFOLIO // ALL_RIGHTS_RESERVED
          </div>
          <div className="flex gap-6">
            <Github size={18} className="text-gray-500 hover:text-cyber-green cursor-pointer" />
            <Mail size={18} className="text-gray-500 hover:text-cyber-green cursor-pointer" />
            <Globe size={18} className="text-gray-500 hover:text-cyber-green cursor-pointer" />
          </div>
          <div className="text-[10px] text-cyber-green font-mono">
            STATUS: SYSTEM_OPTIMAL // LATENCY: 14ms
          </div>
        </div>
      </footer>
    </div>
  );
}
