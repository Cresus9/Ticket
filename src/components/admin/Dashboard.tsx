import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, DollarSign, Users, TrendingUp, ArrowUpRight, ArrowDownRight, Loader, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase-client';
import AdminMetricCard from '../../components/admin/AdminMetricCard';
import AdminChart from '../../components/admin/AdminChart';
import { formatCurrency } from '../../utils/formatters';
import toast from 'react-hot-toast';

// Rest of the file remains the same, just ensure all currency formatting uses formatCurrency()
// For example:
// formatCurrency(stats.totalRevenue) instead of `${stats.totalRevenue} GHS`