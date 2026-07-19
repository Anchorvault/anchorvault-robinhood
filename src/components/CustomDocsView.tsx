import { useState, useMemo, useEffect } from 'react';
import { 
  Search, BookOpen, ChevronRight, Copy, Check, 
  MessageSquare, ArrowRight,
  Menu, X, Sparkles, AlertTriangle, Info,
  ChevronDown
} from 'lucide-react';
import { DOCS_PAGES, type DocPage } from '../lib/docsData';

const GithubIcon = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    width={size} 
    height={size} 
    fill="currentColor" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
  </svg>
);

interface CustomDocsViewProps {
  onBackToHome: () => void;
}

export default function CustomDocsView({ onBackToHome }: CustomDocsViewProps) {
  const [activePageId, setActivePageId] = useState<string>(() => {
    const path = window.location.pathname;
    if (path.startsWith('/docs/')) {
      const subpath = path.slice(6);
      if (DOCS_PAGES.some(p => p.id === subpath)) {
        return subpath;
      }
    }
    return "introduction";
  });
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedAccordions, setExpandedAccordions] = useState<Record<string, boolean>>({});
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [stars, setStars] = useState<number | null>(null);

  useEffect(() => {
    fetch("https://api.github.com/repos/shriyashsoni/AnchorVault")
      .then(res => {
        if (!res.ok) throw new Error("Private or offline");
        return res.json();
      })
      .then(data => {
        if (data && typeof data.stargazers_count === 'number') {
          setStars(data.stargazers_count);
        }
      })
      .catch(() => {
        setStars(0);
      });
  }, []);

  // Update URL when active page changes
  useEffect(() => {
    const newPath = `/docs/${activePageId}`;
    if (window.location.pathname !== newPath) {
      window.history.pushState({}, "", newPath);
    }
  }, [activePageId]);

  // Handle browser back/forward within docs
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path.startsWith('/docs/')) {
        const subpath = path.slice(6);
        if (DOCS_PAGES.some(p => p.id === subpath)) {
          setActivePageId(subpath);
        } else {
          setActivePageId("introduction");
        }
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Group pages by category
  const categories = useMemo(() => {
    const groups: Record<string, DocPage[]> = {};
    DOCS_PAGES.forEach(page => {
      if (!groups[page.category]) {
        groups[page.category] = [];
      }
      groups[page.category].push(page);
    });
    return groups;
  }, []);

  // Filter pages for search results
  const filteredPages = useMemo(() => {
    if (!searchQuery.trim()) return DOCS_PAGES;
    const query = searchQuery.toLowerCase();
    return DOCS_PAGES.filter(page => 
      page.title.toLowerCase().includes(query) ||
      page.sidebarTitle.toLowerCase().includes(query) ||
      page.description.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Find currently active page
  const activePage = useMemo(() => {
    return DOCS_PAGES.find(p => p.id === activePageId) || DOCS_PAGES[0];
  }, [activePageId]);

  // Handle copying code blocks
  const handleCopyCode = (code: string, blockId: string) => {
    navigator.clipboard.writeText(code);
    setCopiedStates(prev => ({ ...prev, [blockId]: true }));
    setTimeout(() => {
      setCopiedStates(prev => ({ ...prev, [blockId]: false }));
    }, 2000);
  };

  const toggleAccordion = (id: string) => {
    setExpandedAccordions(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Scroll to active page header when switching
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activePageId]);

  return (
    <div className="min-h-screen bg-[#08080a] text-white flex flex-col font-sans selection:bg-[#00C805]/30 selection:text-white">
      
      {/* 🚀 Docs Top Navigation Header */}
      <header className="sticky top-0 z-50 w-full bg-[#08080a]/80 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="md:hidden p-2 text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition"
          >
            {mobileSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          
          <div onClick={onBackToHome} className="flex items-center gap-2.5 cursor-pointer group">
            <img src="/logo.png" alt="AnchorVault Logo" className="h-7 w-7 object-contain group-hover:rotate-6 transition duration-300" />
            <span className="font-bold text-lg tracking-wider bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
              Anchor<span className="text-[#00C805] group-hover:animate-pulse">Vault</span>
            </span>
            <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded-full text-white/50 font-mono tracking-widest uppercase">
              docs
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* GitHub Repo Button */}
          <a 
            href="https://github.com/shriyashsoni/AnchorVault" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-2 text-sm text-white/70 hover:text-white bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-xl hover:bg-white/10 transition duration-300"
          >
            <GithubIcon size={16} />
            <span>GitHub</span>
            {stars !== null && (
              <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-white/10 font-semibold text-white/80 font-mono">
                ★ {stars}
              </span>
            )}
          </a>

          <button 
            onClick={onBackToHome}
            className="text-xs font-semibold tracking-wider text-white/70 hover:text-white hover:bg-[#00C805]/10 bg-white/5 border border-white/10 px-4 py-2 rounded-xl transition duration-300 flex items-center gap-2"
          >
            <span>Portal</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </header>

      <div className="flex-1 flex w-full relative">

        {/* 🗂️ Sidebar Navigation Menu */}
        <aside className={`
          fixed inset-y-0 left-0 z-40 w-64 md:w-72 bg-[#08080a] border-r border-white/5 pt-20 px-6 flex flex-col gap-6 transition-transform duration-300 ease-in-out md:translate-x-0 md:sticky md:top-20 md:h-[calc(100vh-80px)]
          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          {/* Search box */}
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-white/40 pointer-events-none">
              <Search size={16} />
            </span>
            <input 
              type="text" 
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-[#00C805] focus:border-[#00C805] transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-3 flex items-center text-white/40 hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Navigation Links Scroll Container */}
          <div className="flex-1 overflow-y-auto pr-2 pb-6 space-y-6 scrollbar-thin scrollbar-thumb-white/5">
            {searchQuery.trim() ? (
              // Search view
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-white/40 tracking-wider uppercase pl-2">
                  Search Results ({filteredPages.length})
                </span>
                {filteredPages.map(page => {
                  const PageIcon = page.icon;
                  return (
                    <button
                      key={page.id}
                      onClick={() => {
                        setActivePageId(page.id);
                        setMobileSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 text-left
                        ${activePageId === page.id 
                          ? 'bg-[#00C805]/10 text-[#a855f7] border border-[#00C805]/20 shadow-[0_0_20px_rgba(123,57,252,0.1)]' 
                          : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
                        }
                      `}
                    >
                      <PageIcon size={16} className={activePageId === page.id ? "text-[#a855f7]" : "text-white/50"} />
                      <span className="truncate">{page.sidebarTitle}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              // Category View
              Object.entries(categories).map(([category, pages]) => (
                <div key={category} className="space-y-1.5">
                  <h3 className="text-[10px] font-bold text-white/40 tracking-widest uppercase pl-3 select-none">
                    {category}
                  </h3>
                  <div className="space-y-0.5">
                    {pages.map(page => {
                      const PageIcon = page.icon;
                      return (
                        <button
                          key={page.id}
                          onClick={() => {
                            setActivePageId(page.id);
                            setMobileSidebarOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 text-left border
                            ${activePageId === page.id 
                              ? 'bg-gradient-to-r from-[#00C805]/10 to-[#a855f7]/5 text-[#c084fc] border-[#00C805]/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]' 
                              : 'text-white/60 hover:text-white hover:bg-white/5 border-transparent'
                            }
                          `}
                        >
                          <PageIcon size={15} className={activePageId === page.id ? "text-[#c084fc]" : "text-white/40"} />
                          <span className="truncate">{page.sidebarTitle}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* 📱 Mobile overlay background */}
        {mobileSidebarOpen && (
          <div 
            onClick={() => setMobileSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
          />
        )}

        {/* 📝 Main Content Container */}
        <main className="flex-1 min-w-0 px-6 md:px-12 lg:px-16 py-10 flex gap-12 max-w-7xl mx-auto">
          <div className="flex-1 min-w-0">
            
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-xs font-semibold text-white/40 tracking-wider mb-4 select-none">
              <span>{activePage.category}</span>
              <ChevronRight size={12} />
              <span className="text-white/60 font-semibold">{activePage.sidebarTitle}</span>
            </div>

            {/* Header */}
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent mb-3 font-sans">
              {activePage.title}
            </h1>
            <p className="text-base text-white/60 leading-relaxed font-sans mb-8 border-b border-white/5 pb-8">
              {activePage.description}
            </p>

            {/* Dynamic Rendering Sections */}
            <div className="space-y-10">
              {activePage.content.sections.map((section, sIdx) => {
                const hasTitle = !!section.title;

                return (
                  <div key={sIdx} className="space-y-6">
                    {/* Section Title */}
                    {hasTitle && (
                      <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white/95 mt-6 mb-4 flex items-center gap-2 font-sans border-l-2 border-[#00C805] pl-3">
                        {section.title}
                      </h2>
                    )}

                    {/* Section Subtitle */}
                    {section.subtitle && (
                      <p className="text-sm font-semibold text-white/50 uppercase tracking-widest mt-2">
                        {section.subtitle}
                      </p>
                    )}

                    {/* Section Text */}
                    {section.text && (
                      <p className="text-[15px] text-white/70 leading-relaxed font-sans">
                        {section.text}
                      </p>
                    )}

                    {/* Bullet Points */}
                    {section.bulletPoints && (
                      <ul className="space-y-3.5 pl-6 list-disc text-[15px] text-white/70">
                        {section.bulletPoints.map((bp, bpIdx) => (
                          <li key={bpIdx} className="leading-relaxed font-sans pl-1">
                            {bp}
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Info Banner Callout */}
                    {section.infoCallout && (
                      <div className="flex items-start gap-4 p-4.5 bg-[#00C805]/5 border border-[#00C805]/20 rounded-2xl">
                        <span className="text-[#a855f7] mt-0.5 shrink-0">
                          <Info size={18} />
                        </span>
                        <div className="space-y-1 text-sm font-sans">
                          <span className="font-bold text-[#c084fc] block">
                            {section.infoCallout.title}
                          </span>
                          <span className="text-white/70 leading-relaxed block">
                            {section.infoCallout.text}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Warning Banner Callout */}
                    {section.warningCallout && (
                      <div className="flex items-start gap-4 p-4.5 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
                        <span className="text-amber-500 mt-0.5 shrink-0">
                          <AlertTriangle size={18} />
                        </span>
                        <div className="space-y-1 text-sm font-sans">
                          <span className="font-bold text-amber-400 block">
                            {section.warningCallout.title}
                          </span>
                          <span className="text-white/70 leading-relaxed block">
                            {section.warningCallout.text}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Tip Banner Callout */}
                    {section.tipCallout && (
                      <div className="flex items-start gap-4 p-4.5 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                        <span className="text-emerald-400 mt-0.5 shrink-0">
                          <Sparkles size={18} />
                        </span>
                        <div className="space-y-1 text-sm font-sans">
                          <span className="font-bold text-emerald-400 block">
                            {section.tipCallout.title}
                          </span>
                          <span className="text-white/70 leading-relaxed block">
                            {section.tipCallout.text}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Timeline Steps */}
                    {section.steps && (
                      <div className="space-y-8 pl-4 relative before:absolute before:inset-y-2 before:left-[11px] before:w-[1px] before:bg-white/10">
                        {section.steps.map((step, stIdx) => (
                          <div key={stIdx} className="flex gap-6 relative">
                            {/* Circle number indicator */}
                            <span className="h-6 w-6 rounded-full bg-[#08080a] border border-[#00C805]/50 text-xs font-bold text-[#c084fc] flex items-center justify-center shrink-0 z-10 font-mono shadow-[0_0_10px_rgba(123,57,252,0.2)]">
                              {stIdx + 1}
                            </span>
                            <div className="space-y-1.5 pt-0.5 font-sans">
                              <h4 className="font-bold text-white/95 text-sm tracking-tight">
                                {step.title}
                              </h4>
                              <p className="text-sm text-white/60 leading-relaxed">
                                {step.desc}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 🎴 Cards Grid */}
                    {section.cards && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {section.cards.map((card, cIdx) => (
                          <div 
                            key={cIdx}
                            onClick={() => {
                              if (card.link) {
                                // Find page ID matching link
                                const target = DOCS_PAGES.find(p => p.id === card.link);
                                if (target) {
                                  setActivePageId(target.id);
                                }
                              }
                            }}
                            className={`p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-[#00C805]/30 flex flex-col gap-3.5 hover:bg-white/10 transition duration-300
                              ${card.link ? 'cursor-pointer group' : 'cursor-default'}
                            `}
                          >
                            <span className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-[#c084fc] w-fit flex items-center justify-center group-hover:scale-110 transition duration-300">
                              <BookOpen size={16} />
                            </span>
                            <div className="space-y-1 font-sans">
                              <h4 className="font-bold text-[14px] text-white/90 tracking-tight flex items-center gap-1.5">
                                <span>{card.title}</span>
                                {card.link && <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transform group-hover:translate-x-0.5 transition duration-300 text-[#a855f7]" />}
                              </h4>
                              <p className="text-xs text-white/50 leading-relaxed">
                                {card.desc}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 💻 Custom Code Block with Title and Copy button */}
                    {section.codeBlock && (
                      <div className="rounded-2xl border border-white/5 overflow-hidden bg-[#0c0c0e]">
                        {/* File title banner */}
                        <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-[#09090b] text-[11px] font-mono tracking-wider text-white/40">
                          <span>{section.codeBlock.filename || section.codeBlock.language.toUpperCase()}</span>
                          <button 
                            onClick={() => handleCopyCode(section.codeBlock!.code, `${sIdx}-block`)}
                            className="flex items-center gap-1.5 hover:text-white transition duration-200"
                          >
                            {copiedStates[`${sIdx}-block`] ? <Check size={12} className="text-emerald-400 animate-pulse" /> : <Copy size={12} />}
                            <span>{copiedStates[`${sIdx}-block`] ? "Copied!" : "Copy"}</span>
                          </button>
                        </div>
                        {/* Source code */}
                        <pre className="p-4 overflow-x-auto text-[13px] font-mono text-white/80 leading-relaxed bg-[#0c0c0e]">
                          <code>{section.codeBlock.code}</code>
                        </pre>
                      </div>
                    )}

                    {/* 📚 Accordion dropdown panels */}
                    {section.accordion && (
                      <div className="space-y-3">
                        {section.accordion.map((ac, acIdx) => {
                          const id = `${sIdx}-${acIdx}`;
                          const isOpen = expandedAccordions[id];
                          return (
                            <div key={acIdx} className="rounded-2xl border border-white/10 overflow-hidden bg-white/5">
                              <button
                                onClick={() => toggleAccordion(id)}
                                className="w-full flex items-center justify-between p-4 text-left font-sans font-bold text-sm tracking-tight text-white hover:bg-white/10 transition"
                              >
                                <span>{ac.title}</span>
                                <ChevronDown size={16} className={`text-white/50 transform transition duration-200 ${isOpen ? 'rotate-180 text-white' : ''}`} />
                              </button>
                              {isOpen && (
                                <div className="px-4 pb-4.5 pt-1 text-sm text-white/60 leading-relaxed border-t border-white/5 bg-black/10 font-sans">
                                  {ac.content}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* 📊 Data Grid Tables */}
                    {section.table && (
                      <div className="rounded-2xl border border-white/10 overflow-hidden bg-white/5 w-full overflow-x-auto">
                        <table className="w-full text-left text-sm border-collapse">
                          <thead>
                            <tr className="border-b border-white/10 bg-white/5">
                              {section.table.headers.map((h, hIdx) => (
                                <th key={hIdx} className="px-4.5 py-3.5 font-bold text-white/80 text-xs uppercase tracking-wider select-none font-mono">
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {section.table.rows.map((row, rIdx) => (
                              <tr key={rIdx} className="border-b border-white/5 hover:bg-white/10 transition duration-200">
                                {row.map((cell, cIdx) => (
                                  <td key={cIdx} className="px-4.5 py-3 text-white/60 leading-relaxed font-sans text-xs">
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>

            {/* Page Footer feedback controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-white/5 pt-10 mt-16 gap-6">
              <span className="text-xs text-white/40 tracking-wider">
                Updated on May 31, 2026
              </span>
              
              <div className="flex items-center gap-4">
                <a 
                  href={`https://github.com/shriyashsoni/AnchorVault/issues/new`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-white/50 hover:text-white flex items-center gap-2 transition"
                >
                  <MessageSquare size={13} />
                  <span>Raise issue</span>
                </a>
                
                <span className="h-3 w-[1px] bg-white/10 hidden sm:inline" />

                <a 
                  href={`https://github.com/shriyashsoni/AnchorVault/edit/main/docs/${activePage.id}.mdx`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-[#a855f7] hover:text-[#c084fc] flex items-center gap-2 transition"
                >
                  <GithubIcon size={13} />
                  <span>Suggest edits</span>
                </a>
              </div>
            </div>

          </div>

          {/* 📍 Right Hand Column Table of Contents (Desktop Only) */}
          <div className="hidden lg:block w-52 shrink-0 space-y-6 pt-1">
            <div className="sticky top-28 space-y-4">
              <h4 className="text-[10px] font-bold text-white/40 tracking-widest uppercase select-none">
                On this page
              </h4>
              <nav className="flex flex-col gap-2.5">
                <button 
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="text-[13px] text-[#c084fc] font-semibold text-left tracking-tight truncate border-l border-[#00C805] pl-3.5"
                >
                  Overview
                </button>
                {activePage.content.sections.map((section, sIdx) => {
                  if (!section.title) return null;
                  return (
                    <button
                      key={sIdx}
                      onClick={() => {
                        // Find element matching heading and scroll
                        const headings = Array.from(document.querySelectorAll('h2'));
                        const match = headings.find(h => h.textContent === section.title);
                        if (match) {
                          match.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                      }}
                      className="text-[13px] text-white/50 hover:text-white/80 font-medium text-left tracking-tight truncate border-l border-white/5 hover:border-white/20 pl-3.5 transition"
                    >
                      {section.title}
                    </button>
                  );
                })}
              </nav>

              <hr className="border-white/5" />

              {/* Direct links to other assets */}
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3.5">
                <h5 className="text-[11px] font-bold text-white/70 tracking-tight flex items-center gap-1.5">
                  <Sparkles size={12} className="text-[#a855f7]" />
                  <span>Interactive API</span>
                </h5>
                <p className="text-[11px] text-white/40 leading-normal">
                  Explore full details and try endpoints in the live EVM console.
                </p>
                <button 
                  onClick={() => {
                    const apiPage = DOCS_PAGES.find(p => p.id === "api-reference/introduction");
                    if (apiPage) setActivePageId(apiPage.id);
                  }}
                  className="w-full text-xs font-bold text-center bg-[#00C805] hover:bg-[#8b4ffc] text-white py-2 rounded-xl transition"
                >
                  API Console
                </button>
              </div>
            </div>
          </div>

        </main>
      </div>

    </div>
  );
}
