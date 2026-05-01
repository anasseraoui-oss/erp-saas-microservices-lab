import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBars, FaTimes, FaHome, FaHistory, FaTh, FaTrash } from 'react-icons/fa';
import { type IconType } from 'react-icons';
import { RouteCategory } from "../App";

// --- Icon Wrapper Component (No changes needed) ---
interface IconProps {
    as: IconType;
    className?: string;
    size?: number;
}
const Icon: React.FC<IconProps> = ({ as, ...props }) => {
    const IconComponent = as as React.ElementType;
    return <IconComponent {...props} />;
};

// --- Main AppHeader Component ---
interface AppHeaderProps {
    allRoutes: RouteCategory[];
}

const AppHeader: React.FC<AppHeaderProps> = ({ allRoutes }) => {
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [position, setPosition] = useState({ x: 20, y: 20 });
    const buttonRef = useRef<HTMLButtonElement>(null);
    const offset = useRef({ x: 0, y: 0 });

    const location = useLocation();
    const isHome = location.pathname === '/';
    const [visitedToday, setVisitedToday] = useState<string[]>([]);

    useEffect(() => {
        const savedPosition = localStorage.getItem('draggableMenuButtonPosition');
        if (savedPosition) {
            setPosition(JSON.parse(savedPosition));
        }
    }, []);

    const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (buttonRef.current) {
            setIsDragging(true);
            offset.current = {
                x: e.clientX - buttonRef.current.offsetLeft,
                y: e.clientY - buttonRef.current.offsetTop
            };
            e.preventDefault();
        }
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (isDragging) {
            const newPos = {
                x: e.clientX - offset.current.x,
                y: e.clientY - offset.current.y
            };
            setPosition(newPos);
            e.preventDefault();
        }
    };

    const handleMouseUp = () => {
        if (isDragging) {
            setIsDragging(false);
            setTimeout(() => {
                setPosition(currentPos => {
                    localStorage.setItem('draggableMenuButtonPosition', JSON.stringify(currentPos));
                    return currentPos;
                });
            }, 0);
        }
    };

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    const handleButtonClick = () => {
        if (!isDragging) {
            setIsMenuOpen(true);
        }
    };

    useEffect(() => {
        const today = new Date().toDateString();
        const allVisited: Record<string, string[]> = JSON.parse(localStorage.getItem('visitedPagesWithDate') || '{}');
        const todayPages = allVisited[today] || [];
        setVisitedToday(Array.from(new Set(todayPages)));
    }, [location.pathname]);

    useEffect(() => {
        if (isHome) return;
        const today = new Date().toDateString();
        const currentPath = location.pathname;
        const allVisited: Record<string, string[]> = JSON.parse(localStorage.getItem('visitedPagesWithDate') || '{}');
        const todayPages = allVisited[today] || [];
        if (!todayPages.includes(currentPath)) {
            const updatedTodayPages = [...todayPages, currentPath];
            allVisited[today] = updatedTodayPages;
            localStorage.setItem('visitedPagesWithDate', JSON.stringify(allVisited));
            setVisitedToday(updatedTodayPages);
        }
    }, [location.pathname, isHome]);

    const clearHistory = () => {
        const today = new Date().toDateString();
        const allVisited: Record<string, string[]> = JSON.parse(localStorage.getItem('visitedPagesWithDate') || '{}');
        delete allVisited[today];
        localStorage.setItem('visitedPagesWithDate', JSON.stringify(allVisited));
        setVisitedToday([]);
    };

    const isRTL = document.documentElement.dir === 'rtl';

    if (isHome) {
        return null;
    }

    return (
        <>
            {/* Draggable Menu Button - Premium Glass Style */}
            <button
                ref={buttonRef}
                className="z-50 glass group shadow-xl hover:shadow-indigo-500/30 active:scale-90 transition-all duration-300 flex items-center justify-center border-indigo-500/20"
                style={{
                    position: 'fixed',
                    top: `${position.y}px`,
                    left: `${position.x}px`,
                    cursor: isDragging ? 'grabbing' : 'grab',
                    touchAction: 'none',
                    width: '54px',
                    height: '54px',
                    borderRadius: '18px',
                    color: 'hsl(var(--primary))',
                }}
                onMouseDown={handleMouseDown}
                onClick={handleButtonClick}
                data-bs-toggle="offcanvas"
                data-bs-target="#appOffcanvas"
                aria-controls="appOffcanvas"
            >
                <Icon as={FaBars} size={24} className="group-hover:scale-110 transition-transform duration-300" />
            </button>

            {/* Premium Sidebar - Glassmorphism */}
            <div
                className={`offcanvas ${isRTL ? 'offcanvas-end' : 'offcanvas-start'} glass border-indigo-500/10 shadow-2xl ${isMenuOpen ? 'show' : ''}`}
                style={{
                    width: '320px',
                    transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    visibility: isMenuOpen ? 'visible' : 'hidden'
                }}
                tabIndex={-1}
                id="appOffcanvas"
                aria-labelledby="appOffcanvasLabel"
            >
                {/* Header with High-End aesthetic */}
                <div className="offcanvas-header border-b border-indigo-500/10 px-6 py-4 flex items-center justify-between">
                    <div>
                        <h5 className="offcanvas-title font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500 text-xl" id="appOffcanvasLabel">
                            Navigatio
                        </h5>
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold opacity-70">Control Center</p>
                    </div>
                    <button
                        type="button"
                        className="btn-close dark:btn-close-white opacity-40 hover:opacity-100 transition-all duration-300 hover:rotate-90"
                        onClick={() => setIsMenuOpen(false)}
                        data-bs-dismiss="offcanvas"
                        aria-label="Close"
                    ></button>
                </div>

                {/* Scrollable body with custom stylized scrollbar */}
                <div className="offcanvas-body scrollbar-premium px-4">
                    {/* History Section - Styled as premium cards */}
                    <div className="mb-6 animate-premium-in" style={{ animationDelay: '0.1s' }}>
                        <div className="flex justify-between items-center mb-4 px-2">
                            <h6 className="text-sm font-bold flex items-center gap-2 text-indigo-500/80">
                                <Icon as={FaHistory} /> Today's History
                            </h6>
                            <button
                                onClick={clearHistory}
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-rose-500/10 hover:text-rose-500 text-muted-foreground transition-all duration-200"
                                title="Clear history"
                            >
                                <Icon as={FaTrash} size={14} />
                            </button>
                        </div>
                        <div className="space-y-2">
                            {visitedToday.length > 0 ? (
                                visitedToday.map((path, idx) => (
                                    <Link
                                        key={path}
                                        to={path}
                                        onClick={() => setIsMenuOpen(false)}
                                        className="block p-3 rounded-xl border border-transparent hover:border-indigo-500/20 hover:bg-indigo-500/5 text-sm font-medium transition-all duration-200 group no-underline"
                                        style={{ animationDelay: `${0.1 + idx * 0.05}s` }}
                                    >
                                        <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                                            {path.replace('/', '').replace(/-/g, ' ') || 'Home'}
                                        </span>
                                    </Link>
                                ))
                            ) : (
                                <div className="text-center py-4 bg-muted/30 rounded-xl text-xs text-muted-foreground border border-dashed border-muted">
                                    No browsing activity yet
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Navigation Links - Grouped by Category */}
                    <div className="animate-premium-in" style={{ animationDelay: '0.3s' }}>
                        <h6 className="text-sm font-bold flex items-center gap-2 mb-4 px-2 text-indigo-500/80">
                            <Icon as={FaTh} /> Explore Workspace
                        </h6>
                        <div className="space-y-6">
                            <Link
                                to="/"
                                onClick={() => setIsMenuOpen(false)}
                                className="flex items-center gap-3 p-3 rounded-xl bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 hover:scale-[1.02] active:scale-95 transition-all no-underline"
                            >
                                <Icon as={FaHome} size={20} />
                                <span className="font-semibold">Dashboard Home</span>
                            </Link>

                            {allRoutes.map((category, catIdx) => (
                                <div key={category.category} className="space-y-2">
                                    <p className="px-3 text-[10px] uppercase tracking-[0.2em] font-black text-indigo-500/40">
                                        {category.category}
                                    </p>
                                    <div className="space-y-1">
                                        {category.items.map((item: any, itemIdx: number) => (
                                            <Link
                                                key={item.name}
                                                to={item.link}
                                                onClick={() => setIsMenuOpen(false)}
                                                className="flex items-center gap-3 p-3 rounded-xl hover:bg-indigo-500/5 border border-transparent hover:border-indigo-500/10 transition-all no-underline group"
                                            >
                                                <span className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center group-hover:bg-indigo-500/10 group-hover:text-indigo-500 transition-colors">
                                                    <Icon as={item.icon} size={16} />
                                                </span>
                                                <span className="text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                                                    {item.name}
                                                </span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer branding inside sidebar */}
                <div className="p-6 border-t border-indigo-500/10 bg-indigo-500/5">
                    <div className="flex items-center gap-3 opacity-60">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-[10px] font-bold uppercase tracking-widest">System Operational</span>
                    </div>
                </div>
            </div>

            {isMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-500"
                    onClick={() => setIsMenuOpen(false)}
                ></div>
            )}
        </>
    );
};

export default AppHeader;