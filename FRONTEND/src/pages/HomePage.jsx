
import React from 'react'
import UrlForm from '../components/UrlForm'
import AnonymousUsage from '../components/AnonymousUsage'

const HomePage = () => {
  return (
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-lg border border-white/20 mb-8">
          <h2 className="text-2xl font-bold text-center mb-6">URL Shortener</h2>
          <AnonymousUsage />  
          <UrlForm/>
        </div>
      </div>
  )
}

export default HomePage