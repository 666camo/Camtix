import useDialogFocus from '../../components/useDialogFocus';
import React, { useState, useEffect } from 'react';
import userService from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import Pagination from '../../components/Pagination';

function UserModal({ open, userData, onClose, onBan, onUnban, loading, currentUser }) {
  const { t } = useTranslation();
  useDialogFocus(open && !!userData, onClose);
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
    <div role="dialog" aria-modal="true" aria-label="Kelola user CamTix" className="admin-dialog fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-surface rounded-2xl w-full max-w-md shadow-card flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-bold text-fg">{t('admin.userDetail')}</h2>
          <button aria-label="Tutup dialog" onClick={onClose} className="text-fg-muted hover:text-fg-secondary">✕</button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4 border-b border-border pb-4">
            <div className="w-16 h-16 rounded-full bg-blue-100 text-brand flex items-center justify-center text-2xl font-bold">
              {userData.firstName?.charAt(0) || 'U'}
            </div>
            <div>
              <p className="font-bold text-fg text-lg">{userData.firstName} {userData.lastName}</p>
              <p className="text-sm text-fg-muted">{userData.email}</p>
              <span className={`inline-block mt-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${userData.role === 'ADMIN' ? 'bg-brand-subtle text-brand border-border' : 'bg-slate-100 text-fg-secondary border-border'}`}>{userData.role}</span>
              {isBanned && <span className="inline-block mt-1 ml-2 text-[10px] font-extrabold px-2 py-0.5 rounded-full border bg-red-50 text-red-600 border-red-200">BANNED</span>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-fg-muted font-semibold uppercase">{t('admin.phoneLabel')}</p>
              <p className="font-medium text-fg-secondary">{userData.phone || userData.phoneNumber || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-fg-muted font-semibold uppercase">{t('admin.ageLabel')}</p>
              <p className="font-medium text-fg-secondary">{userData.age || '-'}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-fg-muted font-semibold uppercase">{t('admin.addressLabel')}</p>
              <p className="font-medium text-fg-secondary">{userData.address || '-'}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-fg-muted font-semibold uppercase">{t('admin.verificationStatus')}</p>
              <p className="font-medium text-fg-secondary">{userData.isVerified ? t('admin.verified') : t('admin.unverified')}</p>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-border bg-surface-hover rounded-b-2xl flex justify-end gap-3">
          <button aria-label="Tutup dialog" onClick={onClose} className="px-4 py-2 border border-border rounded-xl text-sm font-bold text-fg-secondary hover:bg-slate-100 transition-colors bg-surface">{t('common.close')}</button>
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
  const [sortBy, setSortBy] = useState('newest');

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await userService.getAllUsers({ page, size });
      if (res && res.data) {
        if (res.data.content) {
          setUsers(res.data.content);
          setTotalPages(res.data.totalPages);
        } else if (Array.isArray(res.data)) {
          setUsers(res.data);
          setTotalPages(Math.ceil(res.data.length / size));
        } else {
          setUsers([]);
          setTotalPages(0);
        }
      } else if (Array.isArray(res)) {
        setUsers(res);
        setTotalPages(Math.ceil(res.length / size));
      }
    } catch (err) {
      setError(t('admin.loadUsersFail'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, size]);

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
    const name = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase();
    const phone = (u.phone || u.phoneNumber || '').toLowerCase();
    const matchQ = !q || name.includes(q) || (u.email && u.email.toLowerCase().includes(q)) || phone.includes(q);
    const matchR = !filterRole || u.role === filterRole;
    return matchQ && matchR;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'newest') return (b.idUser || 0) - (a.idUser || 0);
    if (sortBy === 'oldest') return (a.idUser || 0) - (b.idUser || 0);
    if (sortBy === 'az') {
      const nameA = `${a.firstName || ''} ${a.lastName || ''}`.trim();
      const nameB = `${b.firstName || ''} ${b.lastName || ''}`.trim();
      return nameA.localeCompare(nameB);
    }
    if (sortBy === 'za') {
      const nameA = `${a.firstName || ''} ${a.lastName || ''}`.trim();
      const nameB = `${b.firstName || ''} ${b.lastName || ''}`.trim();
      return nameB.localeCompare(nameA);
    }
    return 0;
  });

  return (
    <div className="admin-page admin-user space-y-6">
      <div className="admin-page-header flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-fg flex items-center gap-2">
            {t('admin.userManagement')}
          </h1>
          <p className="text-sm text-fg-muted mt-1">{t('admin.userSubtitle')}</p>
        </div>
        <button onClick={fetchUsers} className="px-4 py-2 bg-surface border border-border hover:bg-surface-hover text-fg-secondary rounded-xl text-xs font-bold shadow-card transition-colors flex items-center gap-2">
          🔄 {t('common.refresh')}
        </button>
      </div>

      <div className="admin-toolbar flex flex-col sm:flex-row flex-wrap gap-3">
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('admin.searchUserPlaceholder')} aria-label={t('admin.searchUserPlaceholder')}
          className="flex-1 min-w-[200px] px-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-fg focus:outline-none focus:border-brand shadow-card"
        />
        <select aria-label="Filter peran"
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="px-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-fg-secondary focus:outline-none focus:border-brand shadow-card"
        >
          <option value="">{t('admin.allRoles')}</option>
          <option value="USER">USER</option>
          <option value="ADMIN_CAMTIX">ADMIN CAMTIX</option>
          <option value="ADMIN_APLIKASI">ADMIN APLIKASI</option>
        </select>
        <select aria-label="Urutkan data"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-fg-secondary focus:outline-none focus:border-brand shadow-card"
        >
          <option value="newest">Terbaru</option>
          <option value="oldest">Terlama</option>
          <option value="az">Nama: A - Z</option>
          <option value="za">Nama: Z - A</option>
        </select>
      </div>

      <div className="admin-data-table bg-surface border border-border overflow-x-auto" tabIndex={0} aria-label="Data CamTix">
        <div className="grid grid-cols-[auto_2fr_2fr_1fr_auto] gap-4 px-5 py-3 border-b border-border bg-surface text-[10px] font-bold text-fg-muted uppercase tracking-widest min-w-[600px]">
          <span>ID</span>
          <span>{t('booking.fullName')}</span>
          <span>{t('auth.phone')}</span>
          <span className="text-center">Role</span>
          <span className="text-center">{t('history.action')}</span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-fg-muted text-sm">{t('admin.loadingUsers')}</div>
        ) : sorted.length === 0 ? (
          <div className="py-12 text-center text-fg-muted text-sm font-semibold">{t('admin.noUserData')}</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {sorted.map((u) => (
              <div key={u.idUser} className={`grid grid-cols-[auto_2fr_2fr_1fr_auto] gap-4 items-center px-5 py-4 hover:bg-surface-hover transition-colors min-w-[600px] ${u.isBanned ? 'opacity-60' : ''}`}>
                <span className="text-xs font-bold text-fg-muted">#{u.idUser}</span>
                
                <div>
                  <p className="text-sm font-bold text-fg">{u.firstName} {u.lastName}</p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-brand">{u.email}</p>
                  <p className="text-[11px] text-fg-muted mt-0.5">{u.phoneNumber || '-'}</p>
                </div>

                <div className="flex justify-center">
                  <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${
                    u.role === 'ADMIN_CAMTIX' ? 'bg-brand-subtle text-brand border-border' :
                    u.role === 'ADMIN_APLIKASI' ? 'bg-brand-subtle text-brand border-border' :
                    'bg-slate-100 text-fg-secondary border-border'
                  }`}>
                    {u.role}
                  </span>
                </div>

                <div className="flex justify-center">
                  <button 
                    onClick={() => { setSelectedUser(u); setModalOpen(true); }}
                    className="px-3 py-1.5 bg-surface border border-border hover:bg-surface-hover text-fg-secondary rounded-lg text-xs font-bold shadow-card transition-colors"
                  >
                    {t('common.detail')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={users.length}
          pageSize={size}
          onPageChange={setPage}
          onPageSizeChange={setSize}
          pageSizeOptions={[5, 10, 20, 50]}
        />
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
