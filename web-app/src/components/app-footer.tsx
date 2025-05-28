'use client';
import React from 'react';

const AppFooter = React.memo(() => {
  return (
    <footer className="p-4 mt-auto">
      <p className="footer-text">
        © {new Date().getFullYear()} EduAI. All rights reserved.
      </p>
    </footer>
  );
});

AppFooter.displayName = 'AppFooter';
export default AppFooter;
