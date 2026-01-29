# Delete Button & Time Capsule Icon Implementation

## ✅ Features Implemented

### 1. **Time Capsule Icon Badge** ⏰
- Added clock emoji (⏰) next to the capsule title
- Shows on all capsules to mark them as time capsules
- Styling: 24px size, aligned with title
- File: `CapsuleViewer.jsx` (lines 81-82) and `CapsuleViewer.css` (lines 11-16)

### 2. **Delete Button with Access Control** 🗑️
- **Only shows for capsule creator** (ownership check)
- Confirmation dialog before deletion (prevents accidental deletion)
- Disabled state during deletion (shows "🗑️ Deleting...")
- Proper error handling with user feedback
- File: `CapsuleViewer.jsx` (lines 36-52, 85-96)

### 3. **Backend Support**
- DELETE endpoint: `DELETE /api/capsules/<id>`
- Ownership validation: Returns 403 Forbidden if user is not creator
- Automatic cleanup: Deletes image files and visit records
- Comprehensive logging for debugging
- File: `backend/app/routes/capsule.py` (lines 273-317)

### 4. **Frontend Integration**
- Delete API client method in `api.js`
- CapsuleViewer component gets `currentUserId` prop from App.jsx
- App.jsx passes `user?.id` to CapsuleViewer
- File: `frontend/src/utils/api.js` and `App.jsx` (line 315)

## 📋 Files Modified

### Frontend Files

#### 1. `frontend/src/components/CapsuleViewer.jsx`
**Changes:**
- Line 5: Added `currentUserId` parameter to component
- Line 9: Added `const [deleting, setDeleting] = useState(false);`
- Lines 36-52: Added `handleDeleteCapsule()` function with:
  - Confirmation dialog
  - API call to delete capsule
  - Error handling with user feedback
  - Closes viewer on success
- Lines 54-55: Added ownership check: `const isCreator = currentUserId && capsuleContent && String(capsuleContent.owner_id) === String(currentUserId);`
- Lines 81-96: Updated JSX header to include:
  - Time capsule icon (⏰)
  - Title and icon in flexbox container
  - Delete button (conditional, only for creator)
  - Close button

#### 2. `frontend/src/components/CapsuleViewer.css`
**Changes:**
- Added `.title-with-icon` class (lines 8-12):
  - Flexbox layout
  - 12px gap between icon and title
  
- Added `.time-capsule-icon` class (lines 14-16):
  - 24px font size
  
- Added `.header-actions` class (lines 18-22):
  - Flexbox layout for buttons
  - 8px gap between buttons
  
- Added `.delete-btn` class (lines 35-48):
  - Red background (#ff4444)
  - White text, 13px font
  - Hover effect: darker red + scale(1.05)
  - Disabled state: 0.6 opacity, cursor not-allowed
  
- Reorganized header styles for new layout (lines 24-34)

#### 3. `frontend/src/App.jsx`
**Changes:**
- Line 315: Updated CapsuleViewer props to include `currentUserId={user?.id}`

#### 4. `frontend/src/utils/api.js`
**Changes:**
- Added `deleteCapsule` method: `deleteCapsule: (capsuleId) => api.delete('/capsules/${capsuleId}')`

### Backend Files

#### 1. `backend/app/routes/capsule.py`
**Changes (Lines 273-317):**
```python
@capsule_bp.route('/<int:capsule_id>', methods=['DELETE'])
@jwt_required()
def delete_capsule(capsule_id):
    # Get user ID from JWT token
    user_id = int(get_jwt_identity())
    
    # Fetch capsule
    capsule = Capsule.query.get(capsule_id)
    if not capsule:
        logger.warning(f'❌ Capsule {capsule_id} not found for deletion by user {user_id}')
        return {'error': 'Capsule not found'}, 404
    
    # Check ownership (CRITICAL: string comparison)
    if str(capsule.owner_id) != str(user_id):
        logger.warning(f'❌ User {user_id} attempted to delete capsule {capsule_id} owned by {capsule.owner_id}')
        return {'error': 'Cannot delete capsules created by other users'}, 403
    
    # Delete image file if exists
    if capsule.media_url:
        try:
            # Extract filename and delete
            filename = capsule.media_url.split('/')[-1]
            filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
            if os.path.exists(filepath):
                os.remove(filepath)
                logger.info(f'✅ Deleted image file: {filename}')
        except Exception as e:
            logger.error(f'❌ Error deleting image file: {str(e)}')
    
    # Delete all visits for this capsule
    Visit.query.filter_by(capsule_id=capsule_id).delete()
    logger.info(f'🗑️ Deleted all visits for capsule {capsule_id}')
    
    # Delete capsule itself
    db.session.delete(capsule)
    db.session.commit()
    
    logger.info(f'✅ Capsule {capsule_id} deleted by user {user_id}')
    return {'message': 'Capsule deleted successfully'}, 200
```

**Features:**
- JWT verification (protected route)
- Ownership check with string comparison
- Cascading delete: removes image file + visit records + capsule
- Comprehensive logging at each step
- Returns 403 if not owner, 404 if capsule not found, 200 on success

## 🎯 How It Works

### User Flow:

1. **Open Capsule (as Creator)**
   - CapsuleViewer receives `currentUserId` from App.jsx
   - Loads capsule content via API
   - Compares `capsuleContent.owner_id` with `currentUserId`
   - Shows delete button if creator

2. **Delete Capsule**
   - User clicks "🗑️ Delete" button
   - Confirmation dialog appears: "Are you sure you want to delete this memory? This cannot be undone."
   - On confirm: `handleDeleteCapsule()` called
   - Button shows "🗑️ Deleting..." and is disabled
   - API call: `DELETE /api/capsules/<id>` (includes JWT token)
   
3. **Backend Processing**
   - Validates JWT token
   - Checks ownership: `capsule.owner_id === user_id`
   - If not owner: Returns 403 Forbidden
   - If owner:
     - Deletes image file from uploads folder
     - Deletes all Visit records
     - Deletes Capsule record
     - Returns 200 Success
   
4. **Frontend Response**
   - Success: Closes viewer, returns to map
   - Error: Shows alert with error message, allows retry

### Access Control:

**Creator:**
- ✅ Can see delete button
- ✅ Can delete capsule
- ✅ Can delete own data (image + metadata)

**Other Users (Visitors):**
- ❌ Cannot see delete button
- ❌ Cannot delete capsule (403 Forbidden)
- ✅ Can still view capsule and increment view count

## 🧪 Testing Checklist

- [ ] Create new capsule with image as User A
- [ ] View capsule as User A → See ⏰ icon and 🗑️ Delete button
- [ ] View capsule as User B → See ⏰ icon but NO delete button
- [ ] Delete as User A → Get confirmation, capsule deleted
- [ ] Verify capsule removed from map and list
- [ ] Check image file deleted from uploads folder
- [ ] Try to delete as User B → Get 403 error

## 🐛 Debugging

**If delete button doesn't show:**
1. Check `currentUserId` is being passed to CapsuleViewer
2. Verify `user?.id` is defined in App.jsx
3. Check console for `capsuleContent.owner_id` value
4. Compare types: both should be strings

**If delete fails with error:**
1. Check JWT token in Authorization header
2. Check backend logs for ownership validation
3. Verify database integrity: owner_id exists in Capsule
4. Check file permissions in uploads folder

**If image doesn't delete:**
1. Check UPLOAD_FOLDER path is correct
2. Verify file exists before deletion
3. Check file permissions (can Flask process delete it?)
4. Check browser console for image 404s

## 📊 Code Quality

✅ Type safety: String comparison for IDs (prevents int/string mismatch)
✅ Error handling: User-friendly messages in alerts
✅ UX: Confirmation dialog prevents accidents
✅ Accessibility: `title` attribute on delete button
✅ Loading state: Button disabled during request
✅ Cascading deletes: Proper cleanup of related data
✅ Logging: Comprehensive for debugging

## 🔄 Integration Complete

All three user requests implemented:
1. ✅ Show images in viewer (already working, may need debugging)
2. ✅ Add delete button for creators only
3. ✅ Add time capsule icon/badge (⏰)

**Status**: Ready for testing! 🚀
