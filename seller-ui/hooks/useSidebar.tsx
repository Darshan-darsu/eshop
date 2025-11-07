"use client";

import { activeSibarItem } from '@/configs/constants';
import { useAtom } from 'jotai';
import React from 'react'

const useSidebar = () => {
    const [activeSidebar,setActiveSidebar]=useAtom(activeSibarItem);
  return {activeSidebar,setActiveSidebar}
}

export default useSidebar