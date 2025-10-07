// import { useState, useEffect } from 'react';
// import { motion } from 'framer-motion';
// import { User, Mail, Calendar, Edit, Lock, Loader2, Save, X } from 'lucide-react';
// import { useAuth } from '../context/AuthContext';
// import { profileAPI } from '../services/api';

// const Profile = () => {
//   const { user } = useAuth();
//   const [profile, setProfile] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isEditing, setIsEditing] = useState(false);
//   const [isChangingPassword, setIsChangingPassword] = useState(false);
//   const [name, setName] = useState('');
//   const [currentPassword, setCurrentPassword] = useState('');
//   const [newPassword, setNewPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');

//   useEffect(() => {
//     loadProfile();
//   }, []);

//   const loadProfile = async () => {
//     try {
//       const response = await profileAPI.getProfile();
//       setProfile(response.data);
//       setName(response.data.user.name);
//     } catch (error) {
//       console.error('Failed to load profile:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleUpdateProfile = async (e) => {
//     e.preventDefault();
//     setError('');
//     setSuccess('');

//     try {
//       await profileAPI.updateProfile({ name });
//       setSuccess('Profile updated successfully!');
//       setIsEditing(false);
//       loadProfile();
//       setTimeout(() => setSuccess(''), 3000);
//     } catch (err) {
//       setError(err.response?.data?.error || 'Failed to update profile');
//     }
//   };

//   const handleChangePassword = async (e) => {
//     e.preventDefault();
//     setError('');
//     setSuccess('');

//     if (newPassword !== confirmPassword) {
//       setError('Passwords do not match');
//       return;
//     }

//     if (newPassword.length < 6) {
//       setError('Password must be at least 6 characters');
//       return;
//     }

//     try {
//       await profileAPI.changePassword({
//         current_password: currentPassword,
//         new_password: newPassword,
//       });
//       setSuccess('Password changed successfully!');
//       setIsChangingPassword(false);
//       setCurrentPassword('');
//       setNewPassword('');
//       setConfirmPassword('');
//       setTimeout(() => setSuccess(''), 3000);
//     } catch (err) {
//       setError(err.response?.data?.error || 'Failed to change password');
//     }
//   };

//   if (isLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <Loader2 className="w-12 h-12 text-primary-400 animate-spin" />
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-dark-900 py-8 px-4">
//       <div className="max-w-4xl mx-auto">
//         {/* Header */}
//         <motion.div
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="mb-8"
//         >
//           <h1 className="text-4xl font-bold gradient-text mb-2">Profile Settings</h1>
//           <p className="text-gray-400">Manage your account information</p>
//         </motion.div>

//         {/* Success/Error Messages */}
//         {(error || success) && (
//           <motion.div
//             initial={{ opacity: 0, y: -10 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="mb-6"
//           >
//             {error && (
//               <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400">
//                 {error}
//               </div>
//             )}
//             {success && (
//               <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4 text-green-400">
//                 {success}
//               </div>
//             )}
//           </motion.div>
//         )}

//         {/* Profile Info Card */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="card mb-6"
//         >
//           <div className="flex items-center justify-between mb-6">
//             <h2 className="text-2xl font-bold text-white">Personal Information</h2>
//             {!isEditing && (
//               <button
//                 onClick={() => setIsEditing(true)}
//                 className="flex items-center gap-2 px-4 py-2 bg-primary-500/20 text-primary-400 rounded-lg hover:bg-primary-500/30 transition-colors"
//               >
//                 <Edit className="w-4 h-4" />
//                 Edit
//               </button>
//             )}
//           </div>

//           {isEditing ? (
//             <form onSubmit={handleUpdateProfile} className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-300 mb-2">
//                   Confirm New Password
//                 </label>
//                 <input
//                   type="password"
//                   value={confirmPassword}
//                   onChange={(e) => setConfirmPassword(e.target.value)}
//                   className="input-field"
//                   required
//                 />
//               </div>

//               <div className="flex gap-4">
//                 <button type="submit" className="btn-primary flex items-center gap-2">
//                   <Save className="w-4 h-4" />
//                   Update Password
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setIsChangingPassword(false);
//                     setCurrentPassword('');
//                     setNewPassword('');
//                     setConfirmPassword('');
//                     setError('');
//                   }}
//                   className="btn-secondary flex items-center gap-2"
//                 >
//                   <X className="w-4 h-4" />
//                   Cancel
//                 </button>
//               </div>
//             </form>
//           ) : (
//             <p className="text-gray-400">
//               Click the "Change" button to update your password
//             </p>
//           )}
//         </motion.div>
//       </div>
//     </div>
//   );
// };

// export default Profile;-medium text-gray-300 mb-2">
//                   Full Name
//                 </label>
//                 <input
//                   type="text"
//                   value={name}
//                   onChange={(e) => setName(e.target.value)}
//                   className="input-field"
//                   required
//                 />
//               </div>

//               <div className="flex gap-4">
//                 <button type="submit" className="btn-primary flex items-center gap-2">
//                   <Save className="w-4 h-4" />
//                   Save Changes
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setIsEditing(false);
//                     setName(profile.user.name);
//                   }}
//                   className="btn-secondary flex items-center gap-2"
//                 >
//                   <X className="w-4 h-4" />
//                   Cancel
//                 </button>
//               </div>
//             </form>
//           ) : (
//             <div className="space-y-4">
//               <div className="flex items-center gap-4">
//                 <div className="bg-primary-500/20 p-3 rounded-lg">
//                   <User className="w-6 h-6 text-primary-400" />
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-400">Name</p>
//                   <p className="text-lg font-semibold text-white">{profile?.user?.name}</p>
//                 </div>
//               </div>

//               <div className="flex items-center gap-4">
//                 <div className="bg-accent-500/20 p-3 rounded-lg">
//                   <Mail className="w-6 h-6 text-accent-400" />
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-400">Email</p>
//                   <p className="text-lg font-semibold text-white">{profile?.user?.email}</p>
//                 </div>
//               </div>

//               <div className="flex items-center gap-4">
//                 <div className="bg-green-500/20 p-3 rounded-lg">
//                   <Calendar className="w-6 h-6 text-green-400" />
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-400">Member Since</p>
//                   <p className="text-lg font-semibold text-white">
//                     {new Date(profile?.user?.created_at).toLocaleDateString()}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           )}
//         </motion.div>

//         {/* Statistics Card */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.1 }}
//           className="card mb-6"
//         >
//           <h2 className="text-2xl font-bold text-white mb-6">Your Statistics</h2>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             <div className="text-center">
//               <p className="text-3xl font-bold text-primary-400 mb-2">
//                 {profile?.statistics?.total_emotions_detected || 0}
//               </p>
//               <p className="text-gray-400">Emotions Detected</p>
//             </div>
//             <div className="text-center">
//               <p className="text-3xl font-bold text-accent-400 mb-2">
//                 {profile?.statistics?.total_music_recommendations || 0}
//               </p>
//               <p className="text-gray-400">Songs Recommended</p>
//             </div>
//             <div className="text-center">
//               <p className="text-2xl font-bold text-green-400 mb-2 capitalize">
//                 {profile?.statistics?.most_detected_emotion || 'N/A'}
//               </p>
//               <p className="text-gray-400">Most Detected</p>
//             </div>
//           </div>
//         </motion.div>

//         {/* Change Password Card */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.2 }}
//           className="card"
//         >
//           <div className="flex items-center justify-between mb-6">
//             <h2 className="text-2xl font-bold text-white">Change Password</h2>
//             {!isChangingPassword && (
//               <button
//                 onClick={() => setIsChangingPassword(true)}
//                 className="flex items-center gap-2 px-4 py-2 bg-primary-500/20 text-primary-400 rounded-lg hover:bg-primary-500/30 transition-colors"
//               >
//                 <Lock className="w-4 h-4" />
//                 Change
//               </button>
//             )}
//           </div>

//           {isChangingPassword ? (
//             <form onSubmit={handleChangePassword} className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-300 mb-2">
//                   Current Password
//                 </label>
//                 <input
//                   type="password"
//                   value={currentPassword}
//                   onChange={(e) => setCurrentPassword(e.target.value)}
//                   className="input-field"
//                   required
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-300 mb-2">
//                   New Password
//                 </label>
//                 <input
//                   type="password"
//                   value={newPassword}
//                   onChange={(e) => setNewPassword(e.target.value)}
//                   className="input-field"
//                   required
//                   minLength={6}
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font
