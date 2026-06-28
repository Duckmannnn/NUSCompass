// src/data/eusoffOverview.js
export const eusoffOverview = {
  viewBox: { width: 1000, height: 700 },
  
  blocks: [
    // Office - Top Left
    {
      id: 'OFFICE',
      name: 'Office',
      x: 50,
      y: 50,
      width: 180,
      height: 120,
      rotation: -15,
      floors: null,
      available: false,
      color: '#6b7280',
    },
    
    // Block E - Top Center
    {
      id: 'E',
      name: 'Block E',
      x: 550,
      y: 40,
      width: 140,
      height: 160,
      floors: 4,
      available: false,
      color: '#9ca3af',
    },
    
    // Block A - Bottom Left
    {
      id: 'A',
      name: 'Block A',
      x: 150,
      y: 350,
      width: 140,
      height: 180,
      floors: 4,
      available: false,
      color: '#9ca3af',
    },
    
    // Block B - Bottom Center-Left
    {
      id: 'B',
      name: 'Block B',
      x: 340,
      y: 350,
      width: 140,
      height: 180,
      floors: 4,
      available: false,
      color: '#9ca3af',
    },
    
    // Block C - Bottom Center-Right (AVAILABLE!)
    {
      id: 'C',
      name: 'Block C',
      x: 530,
      y: 350,
      width: 160,
      height: 180,
      floors: 4,
      available: true,
      color: '#3b82f6',
    },
    
    // Block D - Middle Right
    {
      id: 'D',
      name: 'Block D',
      x: 740,
      y: 220,
      width: 140,
      height: 160,
      floors: 4,
      available: false,
      color: '#9ca3af',
    },
  ],
  
  connections: [
    { from: 'A', to: 'B', x1: 290, y1: 440, x2: 340, y2: 440 },
    { from: 'B', to: 'C', x1: 480, y1: 440, x2: 530, y2: 440 },
    { from: 'C', to: 'D', x1: 690, y1: 400, x2: 740, y2: 340 },
    { from: 'D', to: 'E', x1: 740, y1: 260, x2: 690, y2: 200 },
    { from: 'B', to: 'E', x1: 410, y1: 350, x2: 600, y2: 200 },
  ],
  
  landmarks: [
    { id: 'bus', name: 'Bus Stop', x: 100, y: 620, icon: '🚌' },
    { id: 'temasek', name: 'Temasek', x: 920, y: 400, icon: '🚪' },
    { id: 'mpc', name: 'MPC Gate', x: 620, y: 10, icon: '🚗' },
  ],
};  