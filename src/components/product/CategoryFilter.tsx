import React, { useState, useEffect, useCallback } from 'react';
import "../../Css/product/CategoryFilter.css";
import AddSubCategoryModal from '../basec/category/AddSubCategoryModal';

interface CategoryFilterProps {
    mainCategories: string[];
    allCategories: string[];
    selectedCategoryPath: string | null;
    onSelectCategory: (path: string | null) => void;
    onAddToCategory?: (categoryPath: string) => void;
    showAddButton?: boolean;
    showAddItemButton?: boolean;
    onAddItemToCategory: (categoryPath: string) => void;
    showSubCategoryButton?: boolean;
    isDarkMode?: boolean;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
                                                           mainCategories,
                                                           allCategories,
                                                           selectedCategoryPath,
                                                           onSelectCategory,
                                                           showAddItemButton,
                                                           onAddItemToCategory,
                                                           showSubCategoryButton,
                                                           isDarkMode
                                                       }) => {
    const [dynamicallyAddedSubCategories, setDynamicallyAddedSubCategories] = useState<Record<string, string[]>>({});
    const [currentPathArray, setCurrentPathArray] = useState<string[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContext, setModalContext] = useState<{ parentPath: string; parentName: string } | null>(null);

    useEffect(() => {
        setCurrentPathArray(selectedCategoryPath ? selectedCategoryPath.split(' > ') : []);
    }, [selectedCategoryPath]);

    const getSubCategoriesFor = useCallback((parentCategoryPath: string): string[] => {
        const pathDepth = parentCategoryPath.split(' > ').length;
        const subsFromCategories = allCategories
            .filter(cat => cat && cat.startsWith(`${parentCategoryPath} > `))
            .map(cat => cat.split(' > ')[pathDepth])
            .filter(sub => sub);

        const dynamicSubs = dynamicallyAddedSubCategories[parentCategoryPath] || [];

        return Array.from(new Set([...subsFromCategories, ...dynamicSubs])).sort();
    }, [allCategories, dynamicallyAddedSubCategories]);

    const handleModalSubmit = useCallback((subCategoryName: string) => {
        if (subCategoryName && modalContext) {
            const { parentPath } = modalContext;
            setDynamicallyAddedSubCategories(prev => {
                const currentSubs = prev[parentPath] || [];
                if (!currentSubs.includes(subCategoryName)) {
                    return { ...prev, [parentPath]: [...currentSubs, subCategoryName] };
                }
                return prev;
            });
            onSelectCategory(`${parentPath} > ${subCategoryName}`);
        }
        setIsModalOpen(false);
        setModalContext(null);
    }, [modalContext, onSelectCategory]);

    const handleModalClose = useCallback(() => {
        setIsModalOpen(false);
        setModalContext(null);
    }, []);

    const handleAddSubCategoryClick = useCallback((fullPathOfThisCategory: string, categoryName: string) => {
        // Use modal instead of prompt for better UX
        setModalContext({
            parentPath: fullPathOfThisCategory,
            parentName: categoryName
        });
        setIsModalOpen(true);
    }, []);

    const addSubCategoryToState = useCallback((parentPath: string, subCategoryName: string) => {
        setDynamicallyAddedSubCategories(prev => {
            const currentSubs = prev[parentPath] || [];
            if (!currentSubs.includes(subCategoryName)) {
                return { ...prev, [parentPath]: [...currentSubs, subCategoryName] };
            }
            return prev;
        });
    }, []);

    const renderCategoryLevel = useCallback((categoriesToList: string[], currentLevel: number, parentPath: string | null = null) => {
        if (!categoriesToList || categoriesToList.length === 0) return null;

        return (
            <div
                key={`level-${currentLevel}`}
                className={`category-filter-level-bar ${isDarkMode ? 'bg-dark-level-accent' : 'bg-light-level-accent'}`}
            >
                {currentLevel === 0 && (
                    <button
                        onClick={() => onSelectCategory(null)}
                        className={`btn btn-sm category-btn me-2 ${
                            selectedCategoryPath === null
                                ? (isDarkMode ? 'btn-light active' : 'btn-primary active')
                                : (isDarkMode ? 'btn-outline-light' : 'btn-outline-secondary')
                        }`}
                        aria-label="Show all categories"
                    >
                        <i className="fas fa-globe-americas me-1" aria-hidden="true"></i> All
                    </button>
                )}
                {categoriesToList.map(categoryName => {
                    const fullPathOfThisCategory = (parentPath ? parentPath + " > " : "") + categoryName;
                    const isSelected = currentPathArray[currentLevel] === categoryName;

                    return (
                        <div key={fullPathOfThisCategory} className="btn-group" role="group">
                            <button
                                onClick={() => onSelectCategory(fullPathOfThisCategory)}
                                className={`btn btn-sm category-btn ${
                                    isSelected
                                        ? (isDarkMode ? 'btn-light active' : 'btn-primary active')
                                        : (isDarkMode ? 'btn-outline-light' : 'btn-outline-secondary')
                                }`}
                                title={categoryName}
                                aria-pressed={isSelected}
                            >
                                {categoryName.length > 20 ? `${categoryName.substring(0, 18)}...` : categoryName}
                            </button>

                            {showSubCategoryButton && (
                                <button
                                    onClick={() => handleAddSubCategoryClick(fullPathOfThisCategory, categoryName)}
                                    className="btn btn-sm btn-info text-white"
                                    title={`Add sub-category to ${categoryName}`}
                                    aria-label={`Add sub-category to ${categoryName}`}
                                >
                                    <i className="fas fa-plus" aria-hidden="true"></i>
                                </button>
                            )}
                            {showAddItemButton && onAddItemToCategory && (
                                <button
                                    onClick={() => onAddItemToCategory(fullPathOfThisCategory)}
                                    className="btn btn-sm btn-success text-white"
                                    title={`Add item to ${categoryName}`}
                                    aria-label={`Add item to ${categoryName}`}
                                >
                                    <i className="fas fa-plus-circle" aria-hidden="true"></i>
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    }, [currentPathArray, isDarkMode, selectedCategoryPath, onSelectCategory, showSubCategoryButton, showAddItemButton, onAddItemToCategory, handleAddSubCategoryClick]);

    // Generate levels to render
    const levelsToRender = [];
    let categoriesForCurrentLevel: string[] = mainCategories;
    let currentParentPath: string | null = null;

    for (let level = 0; level < currentPathArray.length + 1; level++) {
        if (categoriesForCurrentLevel && categoriesForCurrentLevel.length > 0) {
            levelsToRender.push(renderCategoryLevel(categoriesForCurrentLevel, level, currentParentPath));
        } else {
            break;
        }

        const selectedCategoryInLevel = currentPathArray[level];
        if (!selectedCategoryInLevel) break;

        currentParentPath = (currentParentPath ? currentParentPath + " > " : "") + selectedCategoryInLevel;
        categoriesForCurrentLevel = getSubCategoriesFor(currentParentPath);
    }

    return (
        <div className={`category-filter-container mb-3 ${isDarkMode ? 'dark-mode' : ''}`}>
            {levelsToRender.map((level, index) => (
                <React.Fragment key={`level-fragment-${index}`}>
                    {level}
                </React.Fragment>
            ))}

            {selectedCategoryPath && (
                <div
                    className={`selected-path-info mt-2 p-2 rounded ${
                        isDarkMode ? 'bg-secondary-dark-accent text-light' : 'bg-light border'
                    }`}
                    role="status"
                    aria-live="polite"
                >
                    <small>
                        Filtering by: <strong>{selectedCategoryPath.replace(/ > /g, " / ")}</strong>
                    </small>
                </div>
            )}

            <AddSubCategoryModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                onSubmit={handleModalSubmit}
                parentCategoryName={modalContext?.parentName || ''}
                isDarkMode={isDarkMode}
            />
        </div>
    );
};

export default CategoryFilter;