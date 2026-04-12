'use client';
import React from 'react';
import { motion } from 'framer-motion';

const GenerateView: React.FC = () => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8">
      <h1 className="text-2xl font-bold">التوليد</h1>
      <p>هذه صفحة التوليد البسيطة.</p>
    </motion.div>
  );
};

export default GenerateView;
