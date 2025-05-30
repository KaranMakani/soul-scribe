import * as React from "react"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export type TagInputProps = {
  placeholder?: string
  tags: string[]
  setTags: React.Dispatch<React.SetStateAction<string[]>>
  availableTags?: string[]
  maxTags?: number
  className?: string
  onTagClick?: (tag: string) => void
  disabled?: boolean
}

export function TagInput({
  placeholder = "+ Add Tag",
  tags,
  setTags,
  availableTags = [],
  maxTags = 5,
  className,
  onTagClick,
  disabled = false,
}: TagInputProps) {
  const [inputValue, setInputValue] = React.useState("")
  const [isFocused, setIsFocused] = React.useState(false)
  const [suggestionsVisible, setSuggestionsVisible] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const wrapperRef = React.useRef<HTMLDivElement>(null)

  // Filter available tags by those not already selected
  const suggestions = React.useMemo(() => {
    return availableTags.filter(tag => 
      !tags.includes(tag) && 
      tag.toLowerCase().includes(inputValue.toLowerCase())
    )
  }, [availableTags, tags, inputValue])

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim()
    if (
      trimmedTag &&
      !tags.includes(trimmedTag) &&
      tags.length < maxTags
    ) {
      setTags([...tags, trimmedTag])
      setInputValue("")
    }
  }

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index))
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue) {
      e.preventDefault()
      addTag(inputValue)
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags.length - 1)
    }
  }
  
  // Handle clicking outside to close suggestions
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setSuggestionsVisible(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <div 
      ref={wrapperRef}
      className={cn(
        "flex flex-wrap items-center gap-2 p-1.5 rounded-lg bg-dark-100 border border-dark-100 focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 transition-all", 
        isFocused && "ring-2 ring-primary-500 border-primary-500",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {tags.map((tag, index) => (
        <Badge 
          key={index} 
          variant={
            tag === "tutorial" ? "tutorial" : 
            tag === "review" ? "review" : 
            tag === "news" ? "news" : 
            tag === "analysis" ? "analysis" : 
            tag === "promo" ? "promo" : "other"
          }
          className="h-7 px-2 flex items-center text-sm"
          onClick={() => onTagClick?.(tag)}
        >
          <span>{tag}</span>
          {!disabled && (
            <button 
              type="button"
              className="ml-1 text-primary-400 hover:text-primary-300 focus:outline-none" 
              onClick={(e) => {
                e.stopPropagation()
                removeTag(index)
              }}
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </Badge>
      ))}
      
      {tags.length < maxTags && !disabled && (
        <div className="relative flex-1 min-w-[120px]">
          <Input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value)
              setSuggestionsVisible(true)
            }}
            onFocus={() => {
              setIsFocused(true)
              setSuggestionsVisible(true)
            }}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleInputKeyDown}
            placeholder={tags.length === 0 ? placeholder : ""}
            className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 h-7 px-2 py-0 placeholder:text-light-300/50"
          />
          
          {/* Suggestions dropdown */}
          {suggestionsVisible && suggestions.length > 0 && (
            <div className="absolute top-full left-0 mt-1 w-full max-h-48 overflow-y-auto z-10 rounded-md border border-dark-100 bg-white">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="px-3 py-2 text-sm cursor-pointer hover:bg-primary-500/20 text-light-100"
                  onMouseDown={(e) => {
                    e.preventDefault() // Prevent blur before click
                    addTag(suggestion)
                    setSuggestionsVisible(false)
                  }}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
