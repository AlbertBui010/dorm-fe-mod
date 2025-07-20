import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react';
import yeuCauChuyenPhongService from '../services/api/yeuCauChuyenPhongService';

const YeuCauChuyenPhongStatsCard = () => {
  const [stats, setStats] = useState({
    tongYeuCau: 0,
    choDuyet: 0,
    daDuyet: 0,
    tuChoi: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await yeuCauChuyenPhongService.getYeuCauChuyenPhongStats();
      setStats(response.data || {});
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Thống kê yêu cầu chuyển phòng</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Đang tải...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thống kê yêu cầu chuyển phòng</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <AlertTriangle className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-600">{stats.tongYeuCau || 0}</div>
            <div className="text-sm text-gray-600">Tổng yêu cầu</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="text-2xl font-bold text-yellow-600">{stats.choDuyet || 0}</div>
            <div className="text-sm text-gray-600">Chờ duyệt</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-600">{stats.daDuyet || 0}</div>
            <div className="text-sm text-gray-600">Đã duyệt</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-red-600">{stats.tuChoi || 0}</div>
            <div className="text-sm text-gray-600">Từ chối</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default YeuCauChuyenPhongStatsCard; 