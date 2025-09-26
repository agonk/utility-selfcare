import React from 'react'
import lightLogo from '../../assets/termokos-logo.png'
import iconLogo from '../../assets/termokos-icon.png'

interface LogoProps {
  className?: string
  width?: number
  height?: number
  collapsed?: boolean
}

export const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  width = 160, 
  height = 50,
  collapsed = false
}) => {
  if (collapsed) {
    return (
      <img
        src={iconLogo}
        alt="Termokos"
        width={40}
        height={40}
        className={className}
      />
    )
  }

  return (
    <img
      src={lightLogo}
      alt="Termokos"
      width={width}
      height={height}
      className={className}
    />
  )
}