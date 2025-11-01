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
    // State for the offcanvas menu
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

    // State for the draggable button
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [position, setPosition] = useState({ x: 20, y: 20 }); // Default position in pixels
    const buttonRef = useRef<HTMLButtonElement>(null);
    const offset = useRef({ x: 0, y: 0 });

    const location = useLocation();
    const isHome = location.pathname === '/';
    const [visitedToday, setVisitedToday] = useState<string[]>([]); // History logic state

    // --- Effect to Load Button Position on Mount ---
    useEffect(() => {
        const savedPosition = localStorage.getItem('draggableMenuButtonPosition');
        if (savedPosition) {
            setPosition(JSON.parse(savedPosition));
        }
    }, []);

    // --- Drag and Drop Handlers ---
    const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (buttonRef.current) {
            setIsDragging(true);
            // Calculate the mouse click position relative to the button's top-left corner
            offset.current = {
                x: e.clientX - buttonRef.current.offsetLeft,
                y: e.clientY - buttonRef.current.offsetTop
            };
            e.preventDefault(); // Prevent text selection
        }
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (isDragging) {
            // Calculate new position based on mouse movement and initial offset
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
            // Save the final position to localStorage
            // We use a timeout to ensure the state has updated before saving
            setTimeout(() => {
                // This is a common pattern to get the most recent state
                setPosition(currentPos => {
                    localStorage.setItem('draggableMenuButtonPosition', JSON.stringify(currentPos));
                    return currentPos;
                });
            }, 0);
        }
    };

    // --- Effect to Add/Remove Global Event Listeners for Dragging ---
    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        // Cleanup function to remove listeners
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    // --- Logic for opening the menu (preventing drag from opening it) ---
    const handleButtonClick = () => {
        // Only open the menu if the button was not being dragged
        if (!isDragging) {
            setIsMenuOpen(true);
        }
    };

    // History-related logic (no changes)
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

    if (isHome) {
        return null;
    }

    return (
        <>
            {/* Draggable Menu Button */}
            <button
                ref={buttonRef}
                className="btn btn-dark z-3"
                style={{
                    position: 'fixed',
                    top: `${position.y}px`,
                    left: `${position.x}px`,
                    cursor: isDragging ? 'grabbing' : 'grab',
                    touchAction: 'none', // Important for touch devices
                }}
                onMouseDown={handleMouseDown}
                onClick={handleButtonClick} // Use custom click handler
                data-bs-toggle="offcanvas"
                data-bs-target="#appOffcanvas"
                aria-controls="appOffcanvas"
            >
                <Icon as={FaBars} size={20} />
            </button>

            {/* Bootstrap Offcanvas Element */}
            <div
                className={`offcanvas offcanvas-start bg-dark text-white ${isMenuOpen ? 'show' : ''}`}
                tabIndex={-1}
                id="appOffcanvas"
                aria-labelledby="appOffcanvasLabel"
                // This allows us to sync our state when Bootstrap tries to close it
                onTransitionEnd={() => {
                    const el = document.getElementById('appOffcanvas');
                    if (el && !el.classList.contains('show')) {
                        setIsMenuOpen(false);
                    }
                }}
            >
                {/* Offcanvas Header */}
                <div className="offcanvas-header border-bottom border-secondary">
                    <h5 className="offcanvas-title" id="appOffcanvasLabel">Menu</h5>
                    <button
                        type="button"
                        className="btn-close btn-close-white"
                        onClick={() => setIsMenuOpen(false)} // Controlled close
                        data-bs-dismiss="offcanvas"
                        aria-label="Close"
                    ></button>
                </div>

                {/* Offcanvas Body */}
                <div className="offcanvas-body">
                    {/* (All the content inside the offcanvas remains the same) */}
                    <div className="mb-4">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <h6 className="text-secondary d-flex align-items-center mb-0">
                                <Icon as={FaHistory} className="me-2"/> Today's History
                            </h6>
                            <button onClick={clearHistory} className="btn btn-sm btn-outline-danger p-1"
                                    title="Clear today's history">
                                <Icon as={FaTrash}/>
                            </button>
                        </div>
                        <ul className="list-unstyled">
                            {visitedToday.length > 0 ? (
                                visitedToday.map((path) => (
                                    <li key={path}>
                                        <Link to={path} onClick={() => setIsDragging(false)}
                                              className="d-block p-2 rounded text-light text-decoration-none hover-bg-secondary">
                                            {path.replace('/', '').replace(/-/g, ' ') || 'Home'}
                                        </Link>
                                    </li>
                                ))
                            ) : (
                                <li className="p-2 text-muted">No history yet.</li>
                            )}
                        </ul>
                    </div>
                    <div>
                        <h6 className="text-secondary d-flex align-items-center mb-2">
                            <Icon as={FaTh} className="me-2"/> All Pages
                        </h6>
                        <ul className="list-unstyled">
                            <li>
                                <Link to="/" onClick={() => setIsDragging(false)} className="d-flex align-items-center p-2 rounded text-light text-decoration-none hover-bg-secondary">
                                    <Icon as={FaHome} className="me-3" />
                                    Home
                                </Link>
                            </li>
                            {allRoutes.map((category) => (
                                <li key={category.category}>
                                    <p className="p-2 pt-3 text-primary fw-bold mb-1">{category.category}</p>
                                    <ul className="list-unstyled ps-3">
                                        {category.items.map((item) => (
                                            <li key={item.name}>
                                                <Link to={item.link} onClick={() => setIsDragging(false)} className="d-flex align-items-center p-2 rounded text-light text-decoration-none hover-bg-secondary">
                                                    <span className="me-3"><Icon as={item.icon} /></span>
                                                    {item.name}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {isMenuOpen && <div className="offcanvas-backdrop fade show"></div>}
        </>
    );
};

export default AppHeader;