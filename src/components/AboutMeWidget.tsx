'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

const AboutMeWidget = () => {
  const [isLoading] = useState(false) // Set to true if you want to test loading state

  if (isLoading) {
    return (
      <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg rounded-2xl p-3 sm:p-4 md:p-6 shadow-lg border border-white/20 h-full">
        {/* Mobile Loading State */}
        <div className="sm:hidden h-full flex flex-col animate-pulse">
          {/* Header Skeleton */}
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            <div className="flex-1">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-1"></div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
            </div>
          </div>

          {/* Skills Skeleton */}
          <div className="flex gap-0.5 mb-1.5">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-12"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-14"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div>
          </div>

          {/* Experience Skeleton */}
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
          </div>

          {/* Buttons Skeleton */}
          <div className="mt-auto">
            <div className="grid grid-cols-2 gap-1">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            </div>
          </div>
        </div>

        {/* Tablet/Desktop Loading State */}
        <div className="hidden sm:flex flex-col h-full animate-pulse">
          {/* Header Skeleton */}
          <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            <div>
              <div className="h-4 sm:h-5 bg-gray-200 dark:bg-gray-700 rounded w-24 sm:w-32 mb-1 sm:mb-2"></div>
              <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 sm:w-28"></div>
            </div>
          </div>

          {/* Features Skeleton */}
          <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-2 sm:gap-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 sm:w-28 mb-1"></div>
                  <div className="h-2 sm:h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 sm:w-24 hidden sm:block"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Tech Stack Skeleton */}
          <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-12 sm:w-16"
              ></div>
            ))}
          </div>

          {/* Buttons Skeleton */}
          <div className="xl:flex xl:flex-col grid grid-cols-2 gap-2 xl:space-y-2 mt-auto">
            <div className="h-8 sm:h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            <div className="h-8 sm:h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          </div>

          {/* Footer Skeleton */}
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32 sm:w-48 mx-auto"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg rounded-2xl p-3 sm:p-4 md:p-6 shadow-lg border border-white/20 h-full">
      {/* Mobile Compact Layout */}
      <Link href="/portfolio" className="sm:hidden h-full block">
        <div className="h-full flex flex-col cursor-pointer hover:scale-[1.02] transition-transform">
          {/* Header - Profile */}
          <div className="flex items-center gap-2 mb-1.5">
            <div className="relative w-9 h-9 rounded-full overflow-hidden ring-2 ring-white/50">
              <Image
                src="/images/logo/logo.png"
                alt="Jerald Baroro"
                fill
                sizes="36px"
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                Jerald Baroro
              </h2>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Full Stack Developer
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                <span className="text-[9px] text-green-600 dark:text-green-400 font-medium">
                  Available for Hire
                </span>
              </div>
            </div>
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-2 gap-1.5 mb-1.5">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-1.5 text-center">
              <div className="text-base font-bold text-blue-600 dark:text-blue-400">
                5+
              </div>
              <div className="text-[9px] text-blue-700 dark:text-blue-300">
                Years Exp
              </div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-1.5 text-center">
              <div className="text-base font-bold text-purple-600 dark:text-purple-400">
                7
              </div>
              <div className="text-[9px] text-purple-700 dark:text-purple-300">
                Companies
              </div>
            </div>
          </div>

          {/* Tech Stack */}
          <div className="mt-2">
            <div className="flex flex-wrap gap-0.5">
              {['React', 'Next.js', 'Node.js', 'TypeScript'].map((tech) => (
                <span
                  key={tech}
                  className="px-1.5 py-0.5 text-[8px] font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Link>

      {/* Tablet and Desktop Layout */}
      <div className="hidden sm:flex flex-col h-full">
        <div className="flex items-center gap-3 sm:gap-4 xl:gap-6 mb-3 sm:mb-4 xl:mb-6">
          <div className="relative w-12 h-12 sm:w-16 sm:h-16 xl:w-20 xl:h-20 rounded-full overflow-hidden ring-2 ring-white/50">
            <Image
              src="/images/logo/logo.png"
              alt="Jerald Baroro"
              fill
              sizes="(max-width: 640px) 48px, (max-width: 1280px) 64px, 80px"
              className="object-cover"
            />
          </div>
          <div>
            <h2 className="text-base sm:text-lg xl:text-2xl font-semibold text-gray-900 dark:text-white">
              Jerald Baroro
            </h2>
            <p className="text-xs sm:text-sm xl:text-base text-gray-600 dark:text-gray-400">
              Full Stack Developer
            </p>
            <div className="flex items-center gap-2 mt-1 xl:mt-2">
              <div className="w-2 h-2 xl:w-3 xl:h-3 bg-green-500 rounded-full"></div>
              <span className="text-xs xl:text-sm text-green-600 dark:text-green-400 font-medium">
                Available for Hire
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2 sm:space-y-3 xl:space-y-4 mb-3 sm:mb-4 xl:mb-6">
          <div className="flex items-center gap-2 sm:gap-3 xl:gap-4">
            <div className="w-6 h-6 sm:w-8 sm:h-8 xl:w-10 xl:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4 xl:w-5 xl:h-5 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
              </svg>
            </div>
            <div>
              <p className="text-xs sm:text-sm xl:text-base font-medium text-gray-900 dark:text-white">
                Software Engineer
              </p>
              <p className="text-xs xl:text-sm text-gray-600 dark:text-gray-400 hidden sm:block">
                React, Next.js, TypeScript
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 xl:gap-4">
            <div className="w-6 h-6 sm:w-8 sm:h-8 xl:w-10 xl:h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4 xl:w-5 xl:h-5 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <p className="text-xs sm:text-sm xl:text-base font-medium text-gray-900 dark:text-white">
                5+ Years Experience
              </p>
              <p className="text-xs xl:text-sm text-gray-600 dark:text-gray-400 hidden sm:block">
                Web & Mobile Development
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 xl:gap-4">
            <div className="w-6 h-6 sm:w-8 sm:h-8 xl:w-10 xl:h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4 xl:w-5 xl:h-5 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <p className="text-xs sm:text-sm xl:text-base font-medium text-gray-900 dark:text-white">
                Open Source
              </p>
              <p className="text-xs xl:text-sm text-gray-600 dark:text-gray-400 hidden sm:block">
                Passionate about clean code
              </p>
            </div>
          </div>
        </div>

        {/* Tech stack - more compact on mobile */}
        <div className="flex flex-wrap gap-1 sm:gap-2 xl:gap-3 mb-3 sm:mb-4 xl:mb-6">
          {['React', 'Next.js', 'TypeScript', 'Node.js'].map((tech) => (
            <span
              key={tech}
              className="px-2 xl:px-3 py-1 xl:py-1.5 text-xs xl:text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full"
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Action buttons */}
        <div className="xl:flex xl:flex-col grid grid-cols-2 gap-2 xl:gap-3 xl:space-y-0 mt-auto">
          <Link
            href="/portfolio"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 xl:py-3 px-3 sm:px-4 xl:px-6 rounded-lg xl:rounded-xl font-medium transition-colors text-center block text-xs sm:text-sm xl:text-base"
          >
            View Portfolio
          </Link>
          <Link
            href="/contact"
            className="w-full bg-white/50 hover:bg-white/70 dark:bg-gray-800/50 dark:hover:bg-gray-800/70 text-gray-900 dark:text-white py-2 xl:py-3 px-3 sm:px-4 xl:px-6 rounded-lg xl:rounded-xl font-medium transition-colors text-center block text-xs sm:text-sm xl:text-base border border-gray-200 dark:border-gray-700"
          >
            Get in Touch
          </Link>
        </div>

        {/* Availability notice - hide on very small screens */}
        <div className="mt-3 sm:mt-4 xl:mt-6 pt-3 sm:pt-4 xl:pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs xl:text-sm text-gray-500 dark:text-gray-400 text-center">
            <span className="hidden sm:inline">
              Available for freelance projects and full-time opportunities
            </span>
            <span className="sm:hidden">Available for opportunities</span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default AboutMeWidget
