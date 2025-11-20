import React from 'react'

const Footer = () => {
  return (
     <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
            
                * {
                    font-family: 'Poppins', sans-serif;
                }
            `}</style>
            
            <footer className="flex flex-col bg-slate-50 items-center justify-around w-full py-16 text-sm text-gray-800/70">
                <div className="flex items-center gap-8">
                    <a href="#" className="font-medium text-gray-500 hover:text-black transition-all">
                        Home
                    </a>
                    <a href="#" className="font-medium text-gray-500 hover:text-black transition-all">
                        About
                    </a>
                
                    <a href="#" className="font-medium text-gray-500 hover:text-black transition-all">
                        Contact
                    </a>
                  
                </div>
               
                <p className="mt-8 text-center">Copyright © 2025 . All rights reservered.</p>
            </footer>
        </>
  )
}

export default Footer