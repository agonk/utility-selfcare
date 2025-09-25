import React from 'react'
import lightLogo from 'figma:asset/e3cfcd8de72f32f3299c8db88994143ee5e74484.png'
import iconLogo from 'figma:asset/fb35e230f7ff25de5192b7ab71ba012bd622b6eb.png'

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