/**
 * Shared Icon Component
 * Centralized icons using Lucide for consistent modern UI
 */

import React from 'react';
import {
  Coins,
  Bot,
  Search,
  RefreshCw,
  ExternalLink,
  Check,
  AlertTriangle,
  Package,
  TrendingUp,
  TrendingDown,
  History,
  Camera,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ArrowRight,
  X,
  Loader2,
  Star,
  ShoppingCart,
  BarChart3,
  Globe,
  Store,
  Tag,
  Sparkles,
  Smartphone,
  Lightbulb,
  HelpCircle,
  Image as ImageIcon,
  Inbox,
  Share,
  FileText,
  Terminal,
  Pencil,
  Lock,
  User,
  Mail,
  ArrowLeft,
  BookOpen,
  LogOut,
  Settings,
  Info,
  Maximize2,
  Minimize2,
  Sun,
  Moon,
  SunMoon,
  LayoutGrid,
  List,
  Plus,
  MessageCircle,
  QrCode,
  Flashlight,
  Flag,
  Circle,
  CheckCircle2,
} from 'lucide-react-native';
import { View } from 'react-native';

// Default icon props
export interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: any;
}

const defaultProps: IconProps = {
  size: 24,
  // Color should be provided by each usage via useThemeColors()
  // Falls back to a neutral gray that works on both themes
  color: '#8b8ba3',
  strokeWidth: 2,
};

// Export all icons with consistent styling
export const Icons = {
  // Market & Pricing
  Coins: (props: IconProps) => <Coins {...defaultProps} {...props} />,
  Money: (props: IconProps) => <Coins {...defaultProps} {...props} />,
  Price: (props: IconProps) => <Tag {...defaultProps} {...props} />,
  TrendingUp: (props: IconProps) => <TrendingUp {...defaultProps} {...props} />,
  TrendingDown: (props: IconProps) => <TrendingDown {...defaultProps} {...props} />,
  Stats: (props: IconProps) => <BarChart3 {...defaultProps} {...props} />,
  
  // AI & Analysis
  AI: (props: IconProps) => <Bot {...defaultProps} {...props} />,
  Robot: (props: IconProps) => <Bot {...defaultProps} {...props} />,
  Sparkles: (props: IconProps) => <Sparkles {...defaultProps} {...props} />,
  
  // Actions
  Search: (props: IconProps) => <Search {...defaultProps} {...props} />,
  Refresh: (props: IconProps) => <RefreshCw {...defaultProps} {...props} />,
  ExternalLink: (props: IconProps) => <ExternalLink {...defaultProps} {...props} />,
  Camera: (props: IconProps) => <Camera {...defaultProps} {...props} />,
  
  // Status
  Check: (props: IconProps) => <Check {...defaultProps} {...props} />,
  Warning: (props: IconProps) => <AlertTriangle {...defaultProps} {...props} />,
  Close: (props: IconProps) => <X {...defaultProps} {...props} />,
  Loading: (props: IconProps) => <Loader2 {...defaultProps} {...props} />,
  
  // Navigation
  ChevronDown: (props: IconProps) => <ChevronDown {...defaultProps} {...props} />,
  ChevronUp: (props: IconProps) => <ChevronUp {...defaultProps} {...props} />,
  ChevronRight: (props: IconProps) => <ChevronRight {...defaultProps} {...props} />,
  ArrowRight: (props: IconProps) => <ArrowRight {...defaultProps} {...props} />,
  
  // Items
  Package: (props: IconProps) => <Package {...defaultProps} {...props} />,
  History: (props: IconProps) => <History {...defaultProps} {...props} />,
  Star: (props: IconProps) => <Star {...defaultProps} {...props} />,
  
  // Shopping
  Cart: (props: IconProps) => <ShoppingCart {...defaultProps} {...props} />,
  Store: (props: IconProps) => <Store {...defaultProps} {...props} />,
  Globe: (props: IconProps) => <Globe {...defaultProps} {...props} />,
  Smartphone: (props: IconProps) => <Smartphone {...defaultProps} {...props} />,

  // General
  Lightbulb: (props: IconProps) => <Lightbulb {...defaultProps} {...props} />,
  Help: (props: IconProps) => <HelpCircle {...defaultProps} {...props} />,
  Image: (props: IconProps) => <ImageIcon {...defaultProps} {...props} />,
  Inbox: (props: IconProps) => <Inbox {...defaultProps} {...props} />,
  Share: (props: IconProps) => <Share {...defaultProps} {...props} />,
  FileText: (props: IconProps) => <FileText {...defaultProps} {...props} />,
  Terminal: (props: IconProps) => <Terminal {...defaultProps} {...props} />,
  Tag: (props: IconProps) => <Tag {...defaultProps} {...props} />,
  Pencil: (props: IconProps) => <Pencil {...defaultProps} {...props} />,
  Lock: (props: IconProps) => <Lock {...defaultProps} {...props} />,
  User: (props: IconProps) => <User {...defaultProps} {...props} />,
  Mail: (props: IconProps) => <Mail {...defaultProps} {...props} />,
  ArrowLeft: (props: IconProps) => <ArrowLeft {...defaultProps} {...props} />,
  BookOpen: (props: IconProps) => <BookOpen {...defaultProps} {...props} />,
  LogOut: (props: IconProps) => <LogOut {...defaultProps} {...props} />,
  Settings: (props: IconProps) => <Settings {...defaultProps} {...props} />,
  Info: (props: IconProps) => <Info {...defaultProps} {...props} />,
  Maximize: (props: IconProps) => <Maximize2 {...defaultProps} {...props} />,
  Minimize: (props: IconProps) => <Minimize2 {...defaultProps} {...props} />,
  Sun: (props: IconProps) => <Sun {...defaultProps} {...props} />,
  Moon: (props: IconProps) => <Moon {...defaultProps} {...props} />,
  SunMoon: (props: IconProps) => <SunMoon {...defaultProps} {...props} />,
  Grid: (props: IconProps) => <LayoutGrid {...defaultProps} {...props} />,
  List: (props: IconProps) => <List {...defaultProps} {...props} />,
  Plus: (props: IconProps) => <Plus {...defaultProps} {...props} />,
  MessageCircle: (props: IconProps) => <MessageCircle {...defaultProps} {...props} />,
  QrCode: (props: IconProps) => <QrCode {...defaultProps} {...props} />,
  Flashlight: (props: IconProps) => <Flashlight {...defaultProps} {...props} />,
  Flag: (props: IconProps) => <Flag {...defaultProps} {...props} />,
  Circle: (props: IconProps) => <Circle {...defaultProps} {...props} />,
  CheckCircle2: (props: IconProps) => <CheckCircle2 {...defaultProps} {...props} />,
};

// Spinning loader animation wrapper
export function SpinningLoader({ size = 24, color = '#ffffff' }: IconProps) {
  return (
    <View style={{ transform: [{ rotate: '0deg' }] }}>
      <Loader2 size={size} color={color} strokeWidth={2} />
    </View>
  );
}

export default Icons;
