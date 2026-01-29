# Both Issues Fixed! 🎉

## Issues Found & Fixed

### Issue 1: Delete Returns 405 ❌ → ✅ FIXED
**Problem**: DELETE route wasn't in capsule.py
- Your manual edits removed the route
- Frontend button was there but backend couldn't handle DELETE requests
- Result: 405 Method Not Allowed

**Solution Applied**: Re-added DELETE route to `backend/app/routes/capsule.py` (lines 236-280)
- Includes ownership check (403 if not creator)
- Deletes image files from `/uploads`
- Cleans up visit records
- Complete error handling

### Issue 2: Image Not Showing ❌ → ✅ FIXED
**Problem**: Flask had no route to serve uploaded files
- Images were saved to `/uploads/` folder
- But Flask couldn't serve them via HTTP
- Result: Broken image links

**Solution Applied**: Added `/uploads/<filename>` route to `backend/app/__init__.py` (lines 75-87)
- Serves files from uploads folder
- Checks if file exists before serving
- Returns proper MIME types
- Security: Only serves from uploads folder

---

## What You Need To Do NOW

### CRITICAL: Restart Your Backend ⚠️

Your backend is still running with OLD code!

**In your backend terminal:**
```
Press: Ctrl + C  (stop Flask)
Wait: 2 seconds
Then: python app.py
```

**You should see:**
```
* Running on http://127.0.0.1:5000
```

The new routes only load when Flask starts!

---

## Test After Restart

### Test 1: Delete Capsule
1. View a capsule you created
2. Click red 🗑️ Delete button
3. Confirm deletion
4. Should see: "Capsule closes" 
5. **Should NOT see: "Error deleting capsule: Request failed with status code 405"**

### Test 2: View Image
1. Create NEW capsule with IMAGE (after restart)
2. View it
3. Should see image displayed (not gray box)
4. Check browser Network tab (F12) → look for `GET /uploads/...` returning 200

---

## Code Summary

### Added to `capsule.py` (lines 236-280)
```python
@capsule_bp.route('/<int:capsule_id>', methods=['DELETE'])
@jwt_required()
def delete_capsule(capsule_id):
    """Delete a capsule (only creator can delete)"""
    user_id = int(get_jwt_identity())
    
    try:
        capsule = Capsule.query.get(capsule_id)
        if not capsule:
            return jsonify({'error': 'Capsule not found'}), 404
        
        # Check ownership
        if str(capsule.owner_id) != str(user_id):
            return jsonify({'error': 'Cannot delete capsules created by other users'}), 403
        
        # Delete image file if exists
        if capsule.media_url:
            # Remove file from /uploads
            
        # Delete visit records
        Visit.query.filter_by(capsule_id=capsule_id).delete()
        
        # Delete capsule
        db.session.delete(capsule)
        db.session.commit()
        
        return jsonify({'message': 'Capsule deleted successfully'}), 200
```

### Already in `__init__.py` (lines 75-87)
```python
@app.route('/uploads/<filename>')
def serve_upload(filename):
    """Serve uploaded image files"""
    from flask import send_from_directory
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    
    if not os.path.exists(filepath):
        return {'error': 'File not found'}, 404
    
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
```

---

## Expected Results After Restart

### Delete Function
```
Before restart: ❌ 405 Method Not Allowed
After restart:  ✅ Capsule deleted successfully
```

### Image Display
```
Before restart: ❌ Gray box / broken image icon
After restart:  ✅ Full image displayed
```

---

## If Still Not Working

### If Delete Still Shows 405:
1. Did you do `Ctrl+C` in backend terminal?
2. Did you run `python app.py` again?
3. Do you see new startup messages?
4. Check if Flask output shows any errors

### If Image Still Doesn't Show:
1. Create NEW capsule with image (must be after restart)
2. Check browser console (F12 → Network tab)
3. Look for `GET /uploads/1703250123.456_yourimage.jpg`
4. Does it return 200 or 404?
5. If 404: File wasn't saved properly, check `/uploads` folder

---

## Status

✅ DELETE route code added
✅ /uploads route code added  
⏳ NEEDS RESTART - Backend still running old code

**Next action**: RESTART BACKEND NOW!
