import React, { useState, useEffect } from 'react';
import userService from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

function UserModal({ open, userData, onClose, onBan, onUnban, loading, currentUser }) {
  const { t } = useTranslation();
  if (!open || !userData) return null;
  const isBanned = userData.isBanned;

  const canAction = () => {
    if (!currentUser || !userData) return false;
    if (currentUser.idUser === userData.idUser) return false;
    
    if (currentUser.role === 'ADMIN_APLIKASI') {
      return ['ADMIN_CAMTIX', 'USER'].includes(userData.role);
    }
    if (currentUser.role === 'ADMIN_CAMTIX') {
      return userData.role === 'USER';
    }
    return false;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">{t('admin.userDetail')}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
            <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-2xl font-bold">
              {userData.firstName?.charAt(0) || 'U'}
            </div>
            <div>
              <p className="font-bold text-slate-800 text-lg">{userData.firstName} {userData.lastName}</p>
              <p className="text-sm text-slate-500">{userData.email}</p>
              <span className={`inline-block mt-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${userData.role === 'ADMIN' ? 'bg-purple-50 text-purple-600 border-purple-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>{userData.role}</span>
              {isBanned && <span className="inline-block mt-1 ml-2 text-[10px] font-extrabold px-2 py-0.5 rounded-full border bg-red-50 text-red-600 border-red-200">BANNED</span>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">{t('admin.phoneLabel')}</p>
              <p className="font-medium text-slate-700">{userData.phone || userData.phoneNumber || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">{t('admin.ageLabel')}</p>
              <p className="font-medium text-slate-700">{userData.age || '-'}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-slate-400 font-semibold uppercase">{t('admin.addressLabel')}</p>
              <p className="font-medium text-slate-700">{userData.address || '-'}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-slate-400 font-semibold uppercase">{t('admin.verificationStatus')}</p>
              <p className="font-medium text-slate-700">{userData.isVerified ? `✅ ${t('admin.verified')}` : `❌ ${t('admin.unverified')}`}</p>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors bg-white">{t('common.close')}</button>
          {canAction() && (
            isBanned ? (
              <button onClick={() => onUnban(userData.idUser)} disabled={loading} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50">
                {loading ? t('admin.processing') : t('admin.unbanUser')}
              </button>
            ) : (
              <button onClick={() => onBan(userData.idUser)} disabled={loading} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50">
                {loading ? t('admin.processing') : t('admin.banUser')}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default function UserAdmin() {
  const { user } = useAuth();
  const { t } = useTranslation();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('');

  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await userService.getAllUsers(page, size);
      if (res && res.data) {
        if (res.data.content) {
          setUsers(res.data.content);
          setTotalPages(res.data.totalPages);
        } else {
          setUsers(res.data);
        }
      }
    } catch (err) {
      setError(t('admin.loadUsersFail'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const handleBan = async (id) => {
    setActionLoading(true);
    try {
      await userService.banUser(id);
      fetchUsers();
      setSelectedUser(prev => ({...prev, isBanned: true}));
      toast.success(t('admin.banSuccess'));
    } catch (err) {
      toast.error(t('admin.banFail'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnban = async (id) => {
    setActionLoading(true);
    try {
      await userService.unbanUser(id);
      fetchUsers();
      setSelectedUser(prev => ({...prev, isBanned: false}));
      toast.success(t('admin.unbanSuccess'));
    } catch (err) {
      toast.error(t('admin.unbanFail'));
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    const name = `${u.firstName} ${u.lastName}`.toLowerCase();
    const phone = (u.phone || u.phoneNumber || '').toLowerCase();
    const matchQ = !q || name.includes(q) || u.email.toLowerCase().includes(q) || phone.includes(q);
    const matchR = !filterRole || u.role === filterRole;
    return matchQ && matchR;
  });

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
            <span>👥</span> {t('admin.userManagement')}
          </h1>
          <p className="text-sm text-slate-500 mt-1">{t('admin.userSubtitle')}</p>
        </div>
        <button onClick={fetchUsers} className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center gap-2">
          🔄 {t('common.refresh')}
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('admin.searchUserPlaceholder')}
          className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-blue-400 shadow-sm"
        />
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-blue-400 shadow-sm"
        >
          <option value="">{t('admin.allRoles')}</option>
          <option value="USER">USER</option>
          <option value="ADMIN_CAMTIX">ADMIN CAMTIX</option>
          <option value="ADMIN_APLIKASI">ADMIN APLIKASI</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm overflow-x-auto">
        <div className="grid grid-cols-[auto_2fr_2fr_1fr_auto] gap-4 px-5 py-3 border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold text-slate-500 uppercase tracking-widest min-w-[600px]">
          <span>ID</span>
          <span>{t('booking.fullName')}</span>
          <span>{t('auth.phone')}</span>
          <span className="text-center">Role</span>
          <span className="text-center">{t('history.action')}</span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-500 text-sm">{t('admin.loadingUsers')}</div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm font-semibold">{t('admin.noUserData')}</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((u) => (
              <div key={u.idUser} className={`grid grid-cols-[auto_2fr_2fr_1fr_auto] gap-4 items-center px-5 py-4 hover:bg-slate-50 transition-colors min-w-[600px] ${u.isBanned ? 'opacity-60' : ''}`}>
                <span className="text-xs font-bold text-slate-400">#{u.idUser}</span>
                
                <div>
                  <p className="text-sm font-bold text-slate-800">{u.firstName} {u.lastName}</p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-blue-600">{u.email}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{u.phoneNumber || '-'}</p>
                </div>

                <div className="flex justify-center">
                  <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${
                    u.role === 'ADMIN_CAMTIX' ? 'bg-purple-50 text-purple-600 border-purple-200' :
                    u.role === 'ADMIN_APLIKASI' ? 'bg-indigo-50 text-indigo-600 border-indigo-200' :
                    'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                    {u.role}
                  </span>
                </div>

                <div className="flex justify-center">
                  <button 
                    onClick={() => { setSelectedUser(u); setModalOpen(true); }}
                    className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-bold shadow-sm transition-colors"
                  >
                    {t('common.detail')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center px-6 py-4 border-t border-slate-100 text-xs">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50 text-slate-700 font-bold rounded-lg cursor-pointer"
            >
              {t('common.previous')}
            </button>
            <span className="text-slate-500 font-medium font-mono">
              {t('admin.pageOf', { page: page + 1, totalPages })}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50 text-slate-700 font-bold rounded-lg cursor-pointer"
            >
              {t('common.next')}
            </button>
          </div>
        )}
      </div>

      <UserModal 
        open={modalOpen} 
        userData={selectedUser} 
        onClose={() => setModalOpen(false)} 
        onBan={handleBan}
        onUnban={handleUnban}
        loading={actionLoading}
        currentUser={user}
      />
    </div>
  );
}
