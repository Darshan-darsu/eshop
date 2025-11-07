"use client";

import styled, { css, keyframes } from "styled-components";

// --- Keyframes for smooth animation ---
const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const slideIn = keyframes`
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
`;

// --- General Variables ---
const SIDEBAR_WIDTH = '280px';
const TRANSITION_DURATION = '0.3s';
const PRIMARY_COLOR = '#007bff';
const BACKGROUND_COLOR = '#ffffff';
const TEXT_COLOR = '#333333';
const SHADOW_COLOR = 'rgba(0, 0, 0, 0.15)';

// --- Base Styled Components ---

/** * SidebarWrapper: The main container for the sidebar content.
 * It's fixed, slides in, and has a shadow.
 * Receives 'isOpen' prop to control visibility.
 */
export const SidebarWrapper = styled.div<{ $isOpen: boolean }>`
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1000;
    width: ${SIDEBAR_WIDTH};
    height: 100%;
    background: ${BACKGROUND_COLOR};
    color: ${TEXT_COLOR};
    box-shadow: 2px 0 5px ${SHADOW_COLOR};
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    
    // Animation/Visibility Control
    transform: translateX(-100%);
    transition: transform ${TRANSITION_DURATION} ease-out;

    ${props => props.$isOpen && css`
        transform: translateX(0);
        animation: ${slideIn} ${TRANSITION_DURATION} ease-out;
    `}
`;

/**
 * Overlay: A full-screen, translucent layer to dismiss the sidebar.
 * Receives 'isOpen' prop to control visibility.
 */
export const Overlay = styled.div<{ $isOpen: boolean }>`
    position: fixed;
    top: 0;
    left: 0;
    z-index: 999;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.5);
    cursor: pointer;
    
    // Visibility Control
    visibility: hidden;
    opacity: 0;
    transition: opacity ${TRANSITION_DURATION} ease-in-out, visibility ${TRANSITION_DURATION};

    ${props => props.$isOpen && css`
        visibility: visible;
        opacity: 1;
        animation: ${fadeIn} ${TRANSITION_DURATION} ease-in-out;
    `}
`;


/**
 * Header: Top section for logo or title.
 */
export const Header = styled.div`
    padding: 20px;
    border-bottom: 1px solid #eeeeee;
    font-size: 1.5rem;
    font-weight: bold;
    color: ${PRIMARY_COLOR};
    min-height: 60px; /* Ensure a minimum height */
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

/**
 * Body: Main scrollable content area for navigation links, etc.
 */
export const Body = styled.div`
    flex-grow: 1; /* Allows the body to take up all available space */
    padding: 10px 0;
    overflow-y: auto; /* Allows only the body content to scroll */

    // Example item styling
    & > a, & > div {
        display: block;
        padding: 12px 20px;
        text-decoration: none;
        color: ${TEXT_COLOR};
        transition: background-color 0.2s;
        cursor: pointer;
        
        &:hover {
            background-color: #f0f0f0;
        }
    }
    
    & > .active {
        background-color: #e6f2ff;
        color: ${PRIMARY_COLOR};
        border-left: 3px solid ${PRIMARY_COLOR};
        font-weight: 600;
    }
`;

/**
 * Footer: Bottom section for version number or user profile link.
 */
export const Footer = styled.div`
    padding: 15px 20px;
    border-top: 1px solid #eeeeee;
    font-size: 0.85rem;
    color: #999999;
    text-align: center;
`;

// --- Export the combined components ---
export const Sidebar = {
    Wrapper: SidebarWrapper,
    Header,
    Body,
    Overlay,
    Footer,
};