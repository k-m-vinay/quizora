import { useSelector, useDispatch } from 'react-redux'
import { toggleTheme } from '../../store/slices/themeSlice'
import { HiSun, HiMoon } from 'react-icons/hi2'

export default function ThemeToggle({ className = '' }) {
     const { darkMode } = useSelector(state => state.theme)
     const dispatch = useDispatch()

     return (
          <button
               onClick={() => dispatch(toggleTheme())}
               className={`relative p-2 rounded-xl transition-all duration-300 hover:bg-surface-100 dark:hover:bg-surface-800 group ${className}`}
               aria-label="Toggle theme"
          >
               <div className="relative w-5 h-5">
                    <HiSun className={`absolute inset-0 w-5 h-5 text-amber-500 transition-all duration-300 ${darkMode ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'}`} />
                    <HiMoon className={`absolute inset-0 w-5 h-5 text-primary-400 transition-all duration-300 ${darkMode ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'}`} />
               </div>
          </button>
     )
}
