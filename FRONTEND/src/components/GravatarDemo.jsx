import React, { useState } from 'react';
import Avatar, { AvatarGroup } from './Avatar';
import { generateGravatarUrl, checkGravatarExists, getGravatarProfileUrl } from '../utils/gravatar';

const GravatarDemo = () => {
  const [email, setEmail] = useState('');
  const [gravatarExists, setGravatarExists] = useState(null);
  const [isChecking, setIsChecking] = useState(false);

  // Sample users for demo
  const sampleUsers = [
    {
      id: 1,
      username: 'john_doe',
      email: 'john@example.com',
      avatar: '', // Will use Gravatar
      isOnline: true
    },
    {
      id: 2,
      username: 'jane_smith',
      email: 'jane@example.com',
      avatar: '', // Will use Gravatar
      isOnline: false
    },
    {
      id: 3,
      username: 'bob_wilson',
      email: 'bob@example.com',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', // Custom avatar
      isOnline: true
    },
    {
      id: 4,
      username: 'alice_brown',
      email: 'alice@example.com',
      avatar: '', // Will use Gravatar
      isOnline: true
    },
    {
      id: 5,
      username: 'charlie_davis',
      email: 'charlie@example.com',
      avatar: '', // Will use Gravatar
      isOnline: false
    }
  ];

  const handleCheckGravatar = async () => {
    if (!email) return;
    
    setIsChecking(true);
    const exists = await checkGravatarExists(email);
    setGravatarExists(exists);
    setIsChecking(false);
  };

  const gravatarOptions = [
    { value: 'identicon', label: 'Identicon (geometric pattern)' },
    { value: 'monsterid', label: 'MonsterID (monster)' },
    { value: 'wavatar', label: 'Wavatar (cartoon face)' },
    { value: 'retro', label: 'Retro (8-bit style)' },
    { value: 'robohash', label: 'RoboHash (robot)' },
    { value: 'mp', label: 'Mystery Person (silhouette)' },
    { value: 'blank', label: 'Blank (transparent)' }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gravatar Integration Demo</h1>
        <p className="text-gray-600">See how Gravatar works with different email addresses and options</p>
      </div>

      {/* Gravatar Checker */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Check Gravatar Existence</h2>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email to check Gravatar"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={handleCheckGravatar}
            disabled={!email || isChecking}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isChecking ? 'Checking...' : 'Check'}
          </button>
        </div>
        
        {gravatarExists !== null && (
          <div className={`mt-4 p-3 rounded-md ${gravatarExists ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
            {gravatarExists 
              ? '✅ Gravatar exists for this email!' 
              : '⚠️ No Gravatar found for this email (will use default)'
            }
          </div>
        )}

        {email && (
          <div className="mt-4 flex items-center gap-4">
            <Avatar 
              user={{ email, username: 'Preview' }} 
              size={64} 
              showTooltip={true}
            />
            <div>
              <p className="text-sm text-gray-600">Preview for: {email}</p>
              <a 
                href={getGravatarProfileUrl(email)} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                View Gravatar Profile →
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Different Gravatar Styles */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Gravatar Default Styles</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {gravatarOptions.map((option) => (
            <div key={option.value} className="text-center">
              <img
                src={generateGravatarUrl('demo@example.com', { 
                  size: 80, 
                  default: option.value 
                })}
                alt={option.label}
                className="w-20 h-20 rounded-full mx-auto mb-2 border-2 border-gray-200"
              />
              <p className="text-xs text-gray-600">{option.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Avatar Sizes */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Different Avatar Sizes</h2>
        <div className="flex items-center gap-4">
          {[24, 32, 48, 64, 80, 120].map((size) => (
            <div key={size} className="text-center">
              <Avatar 
                user={sampleUsers[0]} 
                size={size}
                showTooltip={true}
              />
              <p className="text-xs text-gray-600 mt-1">{size}px</p>
            </div>
          ))}
        </div>
      </div>

      {/* Sample Users */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Sample User Avatars</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sampleUsers.map((user) => (
            <div key={user.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
              <Avatar 
                user={user} 
                size={48} 
                showTooltip={true}
              />
              <div>
                <p className="font-medium text-gray-900">{user.username}</p>
                <p className="text-sm text-gray-600">{user.email}</p>
                <p className="text-xs text-gray-500">
                  {user.avatar ? 'Custom Avatar' : 'Gravatar'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Avatar Group */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Avatar Group</h2>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">Show 3 users max:</p>
            <AvatarGroup users={sampleUsers} maxDisplay={3} size={40} />
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Show all users:</p>
            <AvatarGroup users={sampleUsers} maxDisplay={10} size={32} />
          </div>
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-blue-900 mb-4">How to Use Gravatar</h2>
        <div className="space-y-3 text-blue-800">
          <p><strong>1. Backend:</strong> User model automatically generates Gravatar URLs based on email</p>
          <p><strong>2. Frontend:</strong> Use the Avatar component to display user avatars</p>
          <p><strong>3. Fallbacks:</strong> Custom avatar → Gravatar → UI Avatars with username</p>
          <p><strong>4. Customization:</strong> Choose from different Gravatar styles and sizes</p>
        </div>
      </div>
    </div>
  );
};

export default GravatarDemo;
