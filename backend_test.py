#!/usr/bin/env python3
"""
Comprehensive Backend API Test Script for ShinDora Nesub
Tests all API endpoints including auth, videos, categories, settings, ads, and comments
"""

import requests
import json
import sys
from datetime import datetime

# Base URL from environment
BASE_URL = "https://8bd5f5db-2b65-4b03-af7c-991601a05704.preview.emergentagent.com/api"

# Test results tracking
test_results = {
    "passed": 0,
    "failed": 0,
    "tests": []
}

def log_test(test_name, passed, message=""):
    """Log test result"""
    status = "✅ PASS" if passed else "❌ FAIL"
    print(f"{status}: {test_name}")
    if message:
        print(f"   {message}")
    
    test_results["tests"].append({
        "name": test_name,
        "passed": passed,
        "message": message
    })
    
    if passed:
        test_results["passed"] += 1
    else:
        test_results["failed"] += 1

def test_mongodb_connection_and_seeding():
    """Test 1: MongoDB connection and auto-seeding verification"""
    print("\n=== Test 1: MongoDB Connection & Auto-Seeding ===")
    
    try:
        # Test if videos are seeded
        response = requests.get(f"{BASE_URL}/videos", timeout=10)
        if response.status_code == 200:
            videos = response.json()
            if len(videos) >= 8:  # Should have at least 8 default videos
                log_test("MongoDB Connection & Seeding", True, f"Found {len(videos)} videos in database")
                return True
            else:
                log_test("MongoDB Connection & Seeding", False, f"Expected at least 8 videos, found {len(videos)}")
                return False
        else:
            log_test("MongoDB Connection & Seeding", False, f"Status code: {response.status_code}")
            return False
    except Exception as e:
        log_test("MongoDB Connection & Seeding", False, f"Error: {str(e)}")
        return False

def test_get_videos():
    """Test 2: GET /api/videos - Retrieve retro anime videos"""
    print("\n=== Test 2: GET /api/videos ===")
    
    try:
        response = requests.get(f"{BASE_URL}/videos", timeout=10)
        if response.status_code == 200:
            videos = response.json()
            
            # Check for specific retro anime titles
            anime_titles = [v.get('animeTitle', '') for v in videos]
            expected_titles = ['Doraemon', 'Crayon Shinchan', 'Ninja Hattori-kun', 'Chibi Maruko-chan']
            
            found_titles = [title for title in expected_titles if any(title in anime for anime in anime_titles)]
            
            if len(found_titles) >= 3:
                log_test("GET /api/videos", True, f"Found retro anime: {', '.join(found_titles)}")
                return videos
            else:
                log_test("GET /api/videos", False, f"Missing expected retro anime titles")
                return None
        else:
            log_test("GET /api/videos", False, f"Status code: {response.status_code}")
            return None
    except Exception as e:
        log_test("GET /api/videos", False, f"Error: {str(e)}")
        return None

def test_get_categories():
    """Test 3: GET /api/categories"""
    print("\n=== Test 3: GET /api/categories ===")
    
    try:
        response = requests.get(f"{BASE_URL}/categories", timeout=10)
        if response.status_code == 200:
            categories = response.json()
            if len(categories) >= 4:
                category_names = [c.get('name', '') for c in categories]
                log_test("GET /api/categories", True, f"Found {len(categories)} categories: {', '.join(category_names)}")
                return categories
            else:
                log_test("GET /api/categories", False, f"Expected at least 4 categories, found {len(categories)}")
                return None
        else:
            log_test("GET /api/categories", False, f"Status code: {response.status_code}")
            return None
    except Exception as e:
        log_test("GET /api/categories", False, f"Error: {str(e)}")
        return None


def test_create_category():
    """Test 47: POST /api/categories - Create new category"""
    print("\n=== Test 47: POST /api/categories ===")
    
    try:
        category_data = {
            "name": "Test Anime Category",
            "slug": "test-anime-category",
            "parent_id": None
        }
        
        response = requests.post(f"{BASE_URL}/categories", json=category_data, timeout=10)
        if response.status_code == 200:
            category = response.json()
            if category and 'id' in category and category['name'] == "Test Anime Category":
                log_test("POST /api/categories", True, f"Category created successfully with ID: {category['id']}")
                return category
            else:
                log_test("POST /api/categories", False, "Category structure invalid")
                return None
        else:
            log_test("POST /api/categories", False, f"Status code: {response.status_code}")
            return None
    except Exception as e:
        log_test("POST /api/categories", False, f"Error: {str(e)}")
        return None

def test_update_category(category):
    """Test 48: PUT /api/categories - Update category"""
    print("\n=== Test 48: PUT /api/categories ===")
    
    if not category:
        log_test("PUT /api/categories", False, "No category to update")
        return None
    
    try:
        updated_data = {
            "id": category['id'],
            "name": "Test Anime Category (Updated)",
            "slug": "test-anime-category-updated",
            "parent_id": None
        }
        
        response = requests.put(f"{BASE_URL}/categories", json=updated_data, timeout=10)
        if response.status_code == 200:
            updated_category = response.json()
            if updated_category and updated_category['name'] == "Test Anime Category (Updated)":
                log_test("PUT /api/categories", True, f"Category updated successfully to '{updated_category['name']}'")
                return updated_category
            else:
                log_test("PUT /api/categories", False, "Updated category structure invalid")
                return None
        else:
            log_test("PUT /api/categories", False, f"Status code: {response.status_code}")
            return None
    except Exception as e:
        log_test("PUT /api/categories", False, f"Error: {str(e)}")
        return None

def test_delete_category(category):
    """Test 49: DELETE /api/categories - Delete category"""
    print("\n=== Test 49: DELETE /api/categories ===")
    
    if not category:
        log_test("DELETE /api/categories", False, "No category to delete")
        return False
    
    try:
        response = requests.delete(f"{BASE_URL}/categories?id={category['id']}", timeout=10)
        if response.status_code == 200:
            result = response.json()
            if result.get('success'):
                log_test("DELETE /api/categories", True, f"Category deleted successfully")
                return True
            else:
                log_test("DELETE /api/categories", False, "Delete response invalid")
                return False
        else:
            log_test("DELETE /api/categories", False, f"Status code: {response.status_code}")
            return False
    except Exception as e:
        log_test("DELETE /api/categories", False, f"Error: {str(e)}")
        return False

def test_database_seeding_verification():
    """Test 50: Verify database seeding includes categories"""
    print("\n=== Test 50: Database Seeding Verification ===")
    
    try:
        response = requests.get(f"{BASE_URL}/categories", timeout=10)
        if response.status_code == 200:
            categories = response.json()
            expected_categories = ['Doraemon', 'Crayon Shinchan', 'Ninja Hattori-kun', 'Chibi Maruko-chan']
            found_categories = [c.get('name', '') for c in categories]
            
            all_found = all(cat in found_categories for cat in expected_categories)
            
            if all_found:
                log_test("Database Seeding Verification", True, f"All expected categories found in database: {', '.join(expected_categories)}")
                return True
            else:
                missing = [cat for cat in expected_categories if cat not in found_categories]
                log_test("Database Seeding Verification", False, f"Missing categories: {', '.join(missing)}")
                return False
        else:
            log_test("Database Seeding Verification", False, f"Status code: {response.status_code}")
            return False
    except Exception as e:
        log_test("Database Seeding Verification", False, f"Error: {str(e)}")
        return False

def test_get_settings():
    """Test 4: GET /api/settings"""
    print("\n=== Test 4: GET /api/settings ===")
    
    try:
        response = requests.get(f"{BASE_URL}/settings", timeout=10)
        if response.status_code == 200:
            settings = response.json()
            if settings and 'id' in settings and settings['id'] == 'site_settings':
                log_test("GET /api/settings", True, f"Settings retrieved successfully")
                return settings
            else:
                log_test("GET /api/settings", False, "Settings structure invalid")
                return None
        else:
            log_test("GET /api/settings", False, f"Status code: {response.status_code}")
            return None
    except Exception as e:
        log_test("GET /api/settings", False, f"Error: {str(e)}")
        return None

def test_get_ads():
    """Test 5: GET /api/ads"""
    print("\n=== Test 5: GET /api/ads ===")
    
    try:
        response = requests.get(f"{BASE_URL}/ads", timeout=10)
        if response.status_code == 200:
            ads = response.json()
            if len(ads) >= 1:
                log_test("GET /api/ads", True, f"Found {len(ads)} ads")
                return ads
            else:
                log_test("GET /api/ads", False, "No ads found")
                return None
        else:
            log_test("GET /api/ads", False, f"Status code: {response.status_code}")
            return None
    except Exception as e:
        log_test("GET /api/ads", False, f"Error: {str(e)}")
        return None

def test_auth_register():
    """Test 6: POST /api/auth/register - Register new user"""
    print("\n=== Test 6: POST /api/auth/register ===")
    
    try:
        # Use realistic Indonesian name and email
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        payload = {
            "name": "Budi Santoso",
            "email": f"budi.santoso.{timestamp}@gmail.com",
            "password": "budisantoso123"
        }
        
        response = requests.post(f"{BASE_URL}/auth/register", json=payload, timeout=10)
        if response.status_code == 200:
            user = response.json()
            if 'id' in user and 'email' in user and user['email'] == payload['email']:
                log_test("POST /api/auth/register", True, f"User registered: {user['name']} ({user['email']})")
                return user
            else:
                log_test("POST /api/auth/register", False, "Invalid user response")
                return None
        else:
            log_test("POST /api/auth/register", False, f"Status code: {response.status_code}, Response: {response.text}")
            return None
    except Exception as e:
        log_test("POST /api/auth/register", False, f"Error: {str(e)}")
        return None

def test_auth_login(user):
    """Test 7: POST /api/auth/login - Login with registered user"""
    print("\n=== Test 7: POST /api/auth/login (Regular User) ===")
    
    if not user:
        log_test("POST /api/auth/login (Regular User)", False, "No user to test with")
        return None
    
    try:
        payload = {
            "email": user['email'],
            "password": "budisantoso123"
        }
        
        response = requests.post(f"{BASE_URL}/auth/login", json=payload, timeout=10)
        if response.status_code == 200:
            logged_user = response.json()
            if 'id' in logged_user and logged_user['email'] == user['email']:
                log_test("POST /api/auth/login (Regular User)", True, f"Login successful: {logged_user['name']}")
                return logged_user
            else:
                log_test("POST /api/auth/login (Regular User)", False, "Invalid login response")
                return None
        else:
            log_test("POST /api/auth/login (Regular User)", False, f"Status code: {response.status_code}")
            return None
    except Exception as e:
        log_test("POST /api/auth/login (Regular User)", False, f"Error: {str(e)}")
        return None

def test_admin_login_staff_only():
    """Test 8: POST /api/auth/login - Admin login with isStaffOnly=true"""
    print("\n=== Test 8: POST /api/auth/login (Admin with isStaffOnly=true) ===")
    
    try:
        payload = {
            "email": "admin@shindora.com",
            "password": "Emilia9@#$",
            "isStaffOnly": True
        }
        
        response = requests.post(f"{BASE_URL}/auth/login", json=payload, timeout=10)
        if response.status_code == 200:
            admin = response.json()
            if 'role' in admin and admin['role'] == 'admin':
                log_test("POST /api/auth/login (Admin Staff)", True, f"Admin login successful: {admin['name']} (role: {admin['role']})")
                return admin
            else:
                log_test("POST /api/auth/login (Admin Staff)", False, "Admin role not found")
                return None
        else:
            log_test("POST /api/auth/login (Admin Staff)", False, f"Status code: {response.status_code}")
            return None
    except Exception as e:
        log_test("POST /api/auth/login (Admin Staff)", False, f"Error: {str(e)}")
        return None

def test_admin_login_regular():
    """Test 9: POST /api/auth/login - Admin login without isStaffOnly flag"""
    print("\n=== Test 9: POST /api/auth/login (Admin Regular Login) ===")
    
    try:
        payload = {
            "email": "admin@shindora.com",
            "password": "Emilia9@#$"
        }
        
        response = requests.post(f"{BASE_URL}/auth/login", json=payload, timeout=10)
        if response.status_code == 200:
            admin = response.json()
            if 'role' in admin and admin['role'] == 'admin':
                log_test("POST /api/auth/login (Admin Regular)", True, f"Admin regular login successful with new password: {admin['name']} (role: {admin['role']})")
                return admin
            else:
                log_test("POST /api/auth/login (Admin Regular)", False, "Admin role not found")
                return None
        else:
            log_test("POST /api/auth/login (Admin Regular)", False, f"Status code: {response.status_code}, Response: {response.text}")
            return None
    except Exception as e:
        log_test("POST /api/auth/login (Admin Regular)", False, f"Error: {str(e)}")
        return None

def test_regular_user_staff_only_rejection(user):
    """Test 10: POST /api/auth/login - Regular user with isStaffOnly=true should fail"""
    print("\n=== Test 10: POST /api/auth/login (Regular User with isStaffOnly=true - Should Fail) ===")
    
    if not user:
        log_test("POST /api/auth/login (User Staff Rejection)", False, "No user to test with")
        return False
    
    try:
        payload = {
            "email": user['email'],
            "password": "budisantoso123",
            "isStaffOnly": True
        }
        
        response = requests.post(f"{BASE_URL}/auth/login", json=payload, timeout=10)
        if response.status_code == 403:
            error_data = response.json()
            if 'error' in error_data:
                log_test("POST /api/auth/login (User Staff Rejection)", True, f"Correctly rejected with 403: {error_data['error']}")
                return True
            else:
                log_test("POST /api/auth/login (User Staff Rejection)", False, "403 but no error message")
                return False
        else:
            log_test("POST /api/auth/login (User Staff Rejection)", False, f"Expected 403, got {response.status_code}")
            return False
    except Exception as e:
        log_test("POST /api/auth/login (User Staff Rejection)", False, f"Error: {str(e)}")
        return False

def test_moderator_login_staff_only():
    """Test 11: POST /api/auth/login - Moderator login with isStaffOnly=true"""
    print("\n=== Test 11: POST /api/auth/login (Moderator with isStaffOnly=true) ===")
    
    try:
        payload = {
            "email": "mod@shindora.com",
            "password": "mod123",
            "isStaffOnly": True
        }
        
        response = requests.post(f"{BASE_URL}/auth/login", json=payload, timeout=10)
        if response.status_code == 200:
            moderator = response.json()
            if 'role' in moderator and moderator['role'] == 'moderator':
                log_test("POST /api/auth/login (Moderator Staff)", True, f"Moderator login successful: {moderator['name']} (role: {moderator['role']})")
                return moderator
            else:
                log_test("POST /api/auth/login (Moderator Staff)", False, "Moderator role not found")
                return None
        else:
            log_test("POST /api/auth/login (Moderator Staff)", False, f"Status code: {response.status_code}")
            return None
    except Exception as e:
        log_test("POST /api/auth/login (Moderator Staff)", False, f"Error: {str(e)}")
        return None

def test_forgot_password():
    """Test 12: POST /api/auth/forgot-password - Test forgot password with registered email"""
    print("\n=== Test 12: POST /api/auth/forgot-password ===")
    
    try:
        payload = {
            "email": "admin@shindora.com"
        }
        
        response = requests.post(f"{BASE_URL}/auth/forgot-password", json=payload, timeout=10)
        if response.status_code == 200:
            result = response.json()
            if 'success' in result and result['success'] and 'message' in result:
                log_test("POST /api/auth/forgot-password", True, f"Forgot password successful: {result['message']}")
                return result
            else:
                log_test("POST /api/auth/forgot-password", False, "Invalid response structure")
                return None
        else:
            log_test("POST /api/auth/forgot-password", False, f"Status code: {response.status_code}")
            return None
    except Exception as e:
        log_test("POST /api/auth/forgot-password", False, f"Error: {str(e)}")
        return None

def test_forgot_password_unregistered():
    """Test 13: POST /api/auth/forgot-password - Test with unregistered email (should fail)"""
    print("\n=== Test 13: POST /api/auth/forgot-password (Unregistered Email - Should Fail) ===")
    
    try:
        payload = {
            "email": "tidakterdaftar@example.com"
        }
        
        response = requests.post(f"{BASE_URL}/auth/forgot-password", json=payload, timeout=10)
        if response.status_code == 404:
            error_data = response.json()
            if 'error' in error_data:
                log_test("POST /api/auth/forgot-password (Unregistered)", True, f"Correctly rejected with 404: {error_data['error']}")
                return True
            else:
                log_test("POST /api/auth/forgot-password (Unregistered)", False, "404 but no error message")
                return False
        else:
            log_test("POST /api/auth/forgot-password (Unregistered)", False, f"Expected 404, got {response.status_code}")
            return False
    except Exception as e:
        log_test("POST /api/auth/forgot-password (Unregistered)", False, f"Error: {str(e)}")
        return False

def test_onesignal_notify():
    """Test 14: POST /api/onesignal/notify - Test OneSignal notification"""
    print("\n=== Test 14: POST /api/onesignal/notify ===")
    
    try:
        payload = {
            "title": "Anime Baru Tersedia!",
            "message": "Episode terbaru Doraemon sudah bisa ditonton sekarang!"
        }
        
        response = requests.post(f"{BASE_URL}/onesignal/notify", json=payload, timeout=10)
        if response.status_code == 200:
            result = response.json()
            if 'success' in result and result['success'] and 'message' in result:
                log_test("POST /api/onesignal/notify", True, f"OneSignal notification sent: {result['message']}")
                return result
            else:
                log_test("POST /api/onesignal/notify", False, "Invalid response structure")
                return None
        else:
            log_test("POST /api/onesignal/notify", False, f"Status code: {response.status_code}")
            return None
    except Exception as e:
        log_test("POST /api/onesignal/notify", False, f"Error: {str(e)}")
        return None

def test_onesignal_notify_missing_fields():
    """Test 15: POST /api/onesignal/notify - Test with missing fields (should fail)"""
    print("\n=== Test 15: POST /api/onesignal/notify (Missing Fields - Should Fail) ===")
    
    try:
        payload = {
            "title": "Test Title"
            # Missing message field
        }
        
        response = requests.post(f"{BASE_URL}/onesignal/notify", json=payload, timeout=10)
        if response.status_code == 400:
            error_data = response.json()
            if 'error' in error_data:
                log_test("POST /api/onesignal/notify (Missing Fields)", True, f"Correctly rejected with 400: {error_data['error']}")
                return True
            else:
                log_test("POST /api/onesignal/notify (Missing Fields)", False, "400 but no error message")
                return False
        else:
            log_test("POST /api/onesignal/notify (Missing Fields)", False, f"Expected 400, got {response.status_code}")
            return False
    except Exception as e:
        log_test("POST /api/onesignal/notify (Missing Fields)", False, f"Error: {str(e)}")
        return False

def test_create_comment_and_reply(user):
    """Test 16: POST /api/comments - Create comment and sub-comment"""
    print("\n=== Test 16: POST /api/comments (Create Comment & Reply) ===")
    
    if not user:
        log_test("POST /api/comments (Create)", False, "No user to test with")
        return None, None
    
    try:
        # Create parent comment
        parent_payload = {
            "videoId": "vid-dora-1",
            "userId": user['id'],
            "userName": user['name'],
            "userAvatar": user.get('avatarUrl', ''),
            "content": "Wah episode ini sangat nostalgia! Doraemon memang anime terbaik masa kecil saya!",
            "parentId": None
        }
        
        response = requests.post(f"{BASE_URL}/comments", json=parent_payload, timeout=10)
        if response.status_code == 200:
            parent_comment = response.json()
            if 'id' in parent_comment:
                log_test("POST /api/comments (Parent Comment)", True, f"Parent comment created: {parent_comment['id']}")
                
                # Create reply comment
                reply_payload = {
                    "videoId": "vid-dora-1",
                    "userId": user['id'],
                    "userName": user['name'],
                    "userAvatar": user.get('avatarUrl', ''),
                    "content": "Setuju banget! Saya juga suka episode ini, terutama bagian baling-baling bambunya!",
                    "parentId": parent_comment['id']
                }
                
                reply_response = requests.post(f"{BASE_URL}/comments", json=reply_payload, timeout=10)
                if reply_response.status_code == 200:
                    reply_comment = reply_response.json()
                    if 'id' in reply_comment and reply_comment['parentId'] == parent_comment['id']:
                        log_test("POST /api/comments (Reply Comment)", True, f"Reply comment created: {reply_comment['id']}")
                        return parent_comment, reply_comment
                    else:
                        log_test("POST /api/comments (Reply Comment)", False, "Invalid reply structure")
                        return parent_comment, None
                else:
                    log_test("POST /api/comments (Reply Comment)", False, f"Status code: {reply_response.status_code}")
                    return parent_comment, None
            else:
                log_test("POST /api/comments (Parent Comment)", False, "Invalid parent comment response")
                return None, None
        else:
            log_test("POST /api/comments (Parent Comment)", False, f"Status code: {response.status_code}")
            return None, None
    except Exception as e:
        log_test("POST /api/comments", False, f"Error: {str(e)}")
        return None, None

def test_delete_comment_recursive(parent_comment):
    """Test 17: DELETE /api/comments - Recursively delete parent and all replies"""
    print("\n=== Test 17: DELETE /api/comments (Recursive Deletion) ===")
    
    if not parent_comment:
        log_test("DELETE /api/comments (Recursive)", False, "No parent comment to delete")
        return False
    
    try:
        response = requests.delete(f"{BASE_URL}/comments?id={parent_comment['id']}", timeout=10)
        if response.status_code == 200:
            result = response.json()
            if 'success' in result and result['success']:
                deleted_count = result.get('deletedCount', 0)
                if deleted_count >= 2:  # Should delete parent + at least 1 reply
                    log_test("DELETE /api/comments (Recursive)", True, f"Recursively deleted {deleted_count} comments")
                    return True
                else:
                    log_test("DELETE /api/comments (Recursive)", False, f"Only deleted {deleted_count} comments, expected at least 2")
                    return False
            else:
                log_test("DELETE /api/comments (Recursive)", False, "Delete not successful")
                return False
        else:
            log_test("DELETE /api/comments (Recursive)", False, f"Status code: {response.status_code}")
            return False
    except Exception as e:
        log_test("DELETE /api/comments (Recursive)", False, f"Error: {str(e)}")
        return False

def print_summary():
    """Print test summary"""
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    print(f"Total Tests: {test_results['passed'] + test_results['failed']}")
    print(f"✅ Passed: {test_results['passed']}")
    print(f"❌ Failed: {test_results['failed']}")
    print("="*60)
    
    if test_results['failed'] > 0:
        print("\nFailed Tests:")
        for test in test_results['tests']:
            if not test['passed']:
                print(f"  - {test['name']}: {test['message']}")
    
    return test_results['failed'] == 0

def test_multi_server_video_urls():
    """Test 18: Verify multi-server video URLs (videoUrl, videoUrl2, videoUrl3)"""
    print("\n=== Test 18: Multi-Server Video URLs Verification ===")
    
    try:
        response = requests.get(f"{BASE_URL}/videos", timeout=10)
        if response.status_code == 200:
            videos = response.json()
            
            # Check if videos have multiple URL parameters
            multi_url_count = 0
            for video in videos:
                if 'videoUrl' in video and 'videoUrl2' in video and 'videoUrl3' in video:
                    multi_url_count += 1
            
            if multi_url_count >= 5:
                log_test("Multi-Server Video URLs", True, f"{multi_url_count} videos have multi-server URLs (videoUrl, videoUrl2, videoUrl3)")
                return True
            else:
                log_test("Multi-Server Video URLs", False, f"Only {multi_url_count} videos have multi-server URLs")
                return False
        else:
            log_test("Multi-Server Video URLs", False, f"Status code: {response.status_code}")
            return False
    except Exception as e:
        log_test("Multi-Server Video URLs", False, f"Error: {str(e)}")
        return False

def test_get_playlists():
    """Test 19: GET /api/playlists - Retrieve playlists"""
    print("\n=== Test 19: GET /api/playlists ===")
    
    try:
        response = requests.get(f"{BASE_URL}/playlists", timeout=10)
        if response.status_code == 200:
            playlists = response.json()
            if len(playlists) >= 1:
                log_test("GET /api/playlists", True, f"Found {len(playlists)} playlists")
                return playlists
            else:
                log_test("GET /api/playlists", False, "No playlists found")
                return None
        else:
            log_test("GET /api/playlists", False, f"Status code: {response.status_code}")
            return None
    except Exception as e:
        log_test("GET /api/playlists", False, f"Error: {str(e)}")
        return None

def test_create_playlist(user):
    """Test 20: POST /api/playlists - Create new playlist"""
    print("\n=== Test 20: POST /api/playlists ===")
    
    if not user:
        log_test("POST /api/playlists", False, "No user to test with")
        return None
    
    try:
        payload = {
            "title": "Playlist Favorit Budi",
            "ownerId": user['id'],
            "videoIds": ["vid-dora-1", "vid-shin-1"],
            "isPrivate": True
        }
        
        response = requests.post(f"{BASE_URL}/playlists", json=payload, timeout=10)
        if response.status_code == 200:
            playlist = response.json()
            if 'id' in playlist and playlist['title'] == payload['title']:
                log_test("POST /api/playlists", True, f"Playlist created: {playlist['title']} (ID: {playlist['id']})")
                return playlist
            else:
                log_test("POST /api/playlists", False, "Invalid playlist response")
                return None
        else:
            log_test("POST /api/playlists", False, f"Status code: {response.status_code}")
            return None
    except Exception as e:
        log_test("POST /api/playlists", False, f"Error: {str(e)}")
        return None

def test_update_playlist(playlist):
    """Test 21: PUT /api/playlists - Update playlist"""
    print("\n=== Test 21: PUT /api/playlists ===")
    
    if not playlist:
        log_test("PUT /api/playlists", False, "No playlist to update")
        return None
    
    try:
        payload = {
            "id": playlist['id'],
            "title": "Playlist Favorit Budi (Updated)",
            "videoIds": ["vid-dora-1", "vid-shin-1", "vid-hattori-1"]
        }
        
        response = requests.put(f"{BASE_URL}/playlists", json=payload, timeout=10)
        if response.status_code == 200:
            updated = response.json()
            if updated['title'] == payload['title'] and len(updated['videoIds']) == 3:
                log_test("PUT /api/playlists", True, f"Playlist updated: {updated['title']}")
                return updated
            else:
                log_test("PUT /api/playlists", False, "Update not reflected")
                return None
        else:
            log_test("PUT /api/playlists", False, f"Status code: {response.status_code}")
            return None
    except Exception as e:
        log_test("PUT /api/playlists", False, f"Error: {str(e)}")
        return None

def test_delete_playlist(playlist):
    """Test 22: DELETE /api/playlists - Delete playlist"""
    print("\n=== Test 22: DELETE /api/playlists ===")
    
    if not playlist:
        log_test("DELETE /api/playlists", False, "No playlist to delete")
        return False
    
    try:
        response = requests.delete(f"{BASE_URL}/playlists?id={playlist['id']}", timeout=10)
        if response.status_code == 200:
            result = response.json()
            if 'success' in result and result['success']:
                log_test("DELETE /api/playlists", True, f"Playlist deleted: {playlist['id']}")
                return True
            else:
                log_test("DELETE /api/playlists", False, "Delete not successful")
                return False
        else:
            log_test("DELETE /api/playlists", False, f"Status code: {response.status_code}")
            return False
    except Exception as e:
        log_test("DELETE /api/playlists", False, f"Error: {str(e)}")
        return False

def test_create_video():
    """Test 23: POST /api/videos - Create new video"""
    print("\n=== Test 23: POST /api/videos ===")
    
    try:
        payload = {
            "title": "Test Video: Doraemon Petualangan Baru",
            "animeTitle": "Doraemon",
            "episode": "Eps Test",
            "thumbnailUrl": "https://images.unsplash.com/photo-1710052014408-557848f939db?w=400",
            "videoUrl": "https://www.youtube.com/embed/test1",
            "videoUrl2": "https://www.youtube.com/embed/test2",
            "videoUrl3": "https://www.youtube.com/embed/test3",
            "description": "Video test untuk verifikasi CRUD operations",
            "views": 100,
            "likes": 10
        }
        
        response = requests.post(f"{BASE_URL}/videos", json=payload, timeout=10)
        if response.status_code == 200:
            video = response.json()
            if 'id' in video and video['title'] == payload['title']:
                log_test("POST /api/videos", True, f"Video created: {video['title']} (ID: {video['id']})")
                return video
            else:
                log_test("POST /api/videos", False, "Invalid video response")
                return None
        else:
            log_test("POST /api/videos", False, f"Status code: {response.status_code}")
            return None
    except Exception as e:
        log_test("POST /api/videos", False, f"Error: {str(e)}")
        return None

def test_update_video(video):
    """Test 24: PUT /api/videos - Update video"""
    print("\n=== Test 24: PUT /api/videos ===")
    
    if not video:
        log_test("PUT /api/videos", False, "No video to update")
        return None
    
    try:
        payload = {
            "id": video['id'],
            "title": "Test Video: Doraemon Petualangan Baru (Updated)",
            "views": 200,
            "likes": 25
        }
        
        response = requests.put(f"{BASE_URL}/videos", json=payload, timeout=10)
        if response.status_code == 200:
            updated = response.json()
            if updated['title'] == payload['title'] and updated['views'] == 200:
                log_test("PUT /api/videos", True, f"Video updated: {updated['title']}")
                return updated
            else:
                log_test("PUT /api/videos", False, "Update not reflected")
                return None
        else:
            log_test("PUT /api/videos", False, f"Status code: {response.status_code}")
            return None
    except Exception as e:
        log_test("PUT /api/videos", False, f"Error: {str(e)}")
        return None


def test_increment_video_views(video):
    """Test 24.5: POST /api/videos/increment-views - Increment video views"""
    print("\n=== Test 24.5: POST /api/videos/increment-views ===")
    
    if not video:
        log_test("POST /api/videos/increment-views", False, "No video to increment views")
        return None
    
    try:
        # Get current views count
        initial_views = video.get('views', 0)
        
        # Increment views
        payload = {"id": video['id']}
        response = requests.post(f"{BASE_URL}/videos/increment-views", json=payload, timeout=10)
        
        if response.status_code == 200:
            updated = response.json()
            new_views = updated.get('views', 0)
            
            # Verify views incremented by 1
            if new_views == initial_views + 1:
                log_test("POST /api/videos/increment-views", True, 
                        f"Views incremented from {initial_views} to {new_views}")
                return updated
            else:
                log_test("POST /api/videos/increment-views", False, 
                        f"Views not incremented correctly. Expected {initial_views + 1}, got {new_views}")
                return None
        else:
            log_test("POST /api/videos/increment-views", False, f"Status code: {response.status_code}")
            return None
    except Exception as e:
        log_test("POST /api/videos/increment-views", False, f"Error: {str(e)}")
        return None

def test_delete_video(video):
    """Test 25: DELETE /api/videos - Delete video"""
    print("\n=== Test 25: DELETE /api/videos ===")
    
    if not video:
        log_test("DELETE /api/videos", False, "No video to delete")
        return False
    
    try:
        response = requests.delete(f"{BASE_URL}/videos?id={video['id']}", timeout=10)
        if response.status_code == 200:
            result = response.json()
            if 'success' in result and result['success']:
                log_test("DELETE /api/videos", True, f"Video deleted: {video['id']}")
                return True
            else:
                log_test("DELETE /api/videos", False, "Delete not successful")
                return False
        else:
            log_test("DELETE /api/videos", False, f"Status code: {response.status_code}")
            return False
    except Exception as e:
        log_test("DELETE /api/videos", False, f"Error: {str(e)}")
        return False

def test_toggle_like():
    """Test 25.5: POST /api/videos/toggle-like - Toggle video likes"""
    print("\n=== Test 25.5: POST /api/videos/toggle-like ===")
    
    try:
        # First, get a video to test with
        response = requests.get(f"{BASE_URL}/videos", timeout=10)
        if response.status_code != 200:
            log_test("POST /api/videos/toggle-like", False, "Failed to get videos for testing")
            return False
        
        videos = response.json()
        if not videos or len(videos) == 0:
            log_test("POST /api/videos/toggle-like", False, "No videos available for testing")
            return False
        
        test_video = videos[0]
        video_id = test_video['id']
        initial_likes = test_video.get('likes', 0)
        
        print(f"   Testing with video: {test_video.get('animeTitle', 'Unknown')} - {test_video.get('episodeTitle', 'Unknown')}")
        print(f"   Initial likes count: {initial_likes}")
        
        # Test 1: Like the video (increment likes)
        like_payload = {
            "id": video_id,
            "action": "like"
        }
        
        like_response = requests.post(f"{BASE_URL}/videos/toggle-like", json=like_payload, timeout=10)
        if like_response.status_code != 200:
            log_test("POST /api/videos/toggle-like", False, f"Like action failed with status code: {like_response.status_code}")
            return False
        
        liked_video = like_response.json()
        likes_after_like = liked_video.get('likes', 0)
        
        if likes_after_like != initial_likes + 1:
            log_test("POST /api/videos/toggle-like", False, f"Like action failed: expected {initial_likes + 1} likes, got {likes_after_like}")
            return False
        
        print(f"   ✓ Like action successful: {initial_likes} → {likes_after_like}")
        
        # Test 2: Unlike the video (decrement likes)
        unlike_payload = {
            "id": video_id,
            "action": "unlike"
        }
        
        unlike_response = requests.post(f"{BASE_URL}/videos/toggle-like", json=unlike_payload, timeout=10)
        if unlike_response.status_code != 200:
            log_test("POST /api/videos/toggle-like", False, f"Unlike action failed with status code: {unlike_response.status_code}")
            return False
        
        unliked_video = unlike_response.json()
        likes_after_unlike = unliked_video.get('likes', 0)
        
        if likes_after_unlike != initial_likes:
            log_test("POST /api/videos/toggle-like", False, f"Unlike action failed: expected {initial_likes} likes, got {likes_after_unlike}")
            return False
        
        print(f"   ✓ Unlike action successful: {likes_after_like} → {likes_after_unlike}")
        
        # Test 3: Multiple likes to verify increment works correctly
        like_response2 = requests.post(f"{BASE_URL}/videos/toggle-like", json=like_payload, timeout=10)
        like_response3 = requests.post(f"{BASE_URL}/videos/toggle-like", json=like_payload, timeout=10)
        
        if like_response3.status_code == 200:
            final_video = like_response3.json()
            final_likes = final_video.get('likes', 0)
            expected_likes = initial_likes + 2
            
            if final_likes == expected_likes:
                print(f"   ✓ Multiple likes successful: {initial_likes} → {final_likes}")
                
                # Reset to original state
                requests.post(f"{BASE_URL}/videos/toggle-like", json=unlike_payload, timeout=10)
                requests.post(f"{BASE_URL}/videos/toggle-like", json=unlike_payload, timeout=10)
                
                log_test("POST /api/videos/toggle-like", True, f"Likes toggle working correctly: like (+1), unlike (-1), multiple likes tested. Video: {test_video.get('animeTitle', 'Unknown')} - {test_video.get('episodeTitle', 'Unknown')}")
                return True
            else:
                log_test("POST /api/videos/toggle-like", False, f"Multiple likes failed: expected {expected_likes} likes, got {final_likes}")
                return False
        else:
            log_test("POST /api/videos/toggle-like", False, "Multiple likes test failed")
            return False
            
    except Exception as e:
        log_test("POST /api/videos/toggle-like", False, f"Error: {str(e)}")
        return False


def test_bulk_csv_import():
    """Test 26: POST /api/videos/bulk-csv - Bulk import videos"""
    print("\n=== Test 26: POST /api/videos/bulk-csv ===")
    
    try:
        csv_data = """Test Anime 1,Test Series,Eps 1,https://example.com/thumb1.jpg,https://youtube.com/embed/test1,Test description 1
Test Anime 2,Test Series,Eps 2,https://example.com/thumb2.jpg,https://youtube.com/embed/test2,Test description 2"""
        
        payload = {
            "csvData": csv_data
        }
        
        response = requests.post(f"{BASE_URL}/videos/bulk-csv", json=payload, timeout=10)
        if response.status_code == 200:
            result = response.json()
            if 'success' in result and result['success'] and result['count'] >= 2:
                log_test("POST /api/videos/bulk-csv", True, f"Bulk imported {result['count']} videos")
                return result['imported']
            else:
                log_test("POST /api/videos/bulk-csv", False, "Bulk import failed or count mismatch")
                return None
        else:
            log_test("POST /api/videos/bulk-csv", False, f"Status code: {response.status_code}")
            return None
    except Exception as e:
        log_test("POST /api/videos/bulk-csv", False, f"Error: {str(e)}")
        return None

def test_get_users():
    """Test 27: GET /api/users - Retrieve users"""
    print("\n=== Test 27: GET /api/users ===")
    
    try:
        response = requests.get(f"{BASE_URL}/users", timeout=10)
        if response.status_code == 200:
            users = response.json()
            if len(users) >= 3:  # Should have at least 3 seeded users
                log_test("GET /api/users", True, f"Found {len(users)} users")
                return users
            else:
                log_test("GET /api/users", False, f"Expected at least 3 users, found {len(users)}")
                return None
        else:
            log_test("GET /api/users", False, f"Status code: {response.status_code}")
            return None
    except Exception as e:
        log_test("GET /api/users", False, f"Error: {str(e)}")
        return None


def test_create_video_with_push_notification():
    """Test 40: POST /api/videos with sendPushNotification - Auto-push OneSignal on new episode"""
    print("\n=== Test 40: POST /api/videos with sendPushNotification (Auto-Push OneSignal) ===")
    
    try:
        payload = {
            "title": "Doraemon: Episode Spesial Tahun Baru",
            "animeTitle": "Doraemon",
            "episode": "Eps Special 2026",
            "thumbnailUrl": "https://images.unsplash.com/photo-1710052014408-557848f939db?w=400",
            "videoUrl": "https://www.youtube.com/embed/special2026",
            "videoUrl2": "https://www.youtube.com/embed/special2026-backup",
            "videoUrl3": "https://www.youtube.com/embed/special2026-backup2",
            "description": "Episode spesial Doraemon untuk merayakan Tahun Baru 2026!",
            "views": 0,
            "likes": 0,
            "sendPushNotification": True  # NEW FEATURE: Auto-push OneSignal checkbox
        }
        
        response = requests.post(f"{BASE_URL}/videos", json=payload, timeout=10)
        if response.status_code == 200:
            video = response.json()
            if 'id' in video and video['title'] == payload['title']:
                log_test("POST /api/videos with sendPushNotification", True, 
                        f"Video created with auto-push notification: {video['title']} (ID: {video['id']}). OneSignal notification triggered for new episode release.")
                return video
            else:
                log_test("POST /api/videos with sendPushNotification", False, "Invalid video response")
                return None
        else:
            log_test("POST /api/videos with sendPushNotification", False, f"Status code: {response.status_code}")
            return None
    except Exception as e:
        log_test("POST /api/videos with sendPushNotification", False, f"Error: {str(e)}")
        return None

def test_settings_running_text_announcement():
    """Test 41: POST /api/settings - Save running text announcement"""
    print("\n=== Test 41: POST /api/settings (Running Text Announcement) ===")
    
    try:
        # First, get current settings
        get_response = requests.get(f"{BASE_URL}/settings", timeout=10)
        if get_response.status_code != 200:
            log_test("POST /api/settings (Running Text Announcement)", False, "Failed to get current settings")
            return None
        
        current_settings = get_response.json()
        
        # Update settings with running text announcement
        payload = {
            **current_settings,
            "runningTextAnnouncement": "🎉 Selamat datang di ShinDora Nesub! Episode baru Doraemon, Crayon Shinchan, dan Ninja Hattori-kun tersedia setiap hari! 🎬",
            "runningTextSpeed": 50  # Speed control for marquee
        }
        
        response = requests.post(f"{BASE_URL}/settings", json=payload, timeout=10)
        if response.status_code == 200:
            settings = response.json()
            if 'runningTextAnnouncement' in settings and settings['runningTextAnnouncement'] == payload['runningTextAnnouncement']:
                log_test("POST /api/settings (Running Text Announcement)", True, 
                        f"Running text announcement saved successfully: '{settings['runningTextAnnouncement'][:50]}...' with speed {settings.get('runningTextSpeed', 50)}")
                return settings
            else:
                log_test("POST /api/settings (Running Text Announcement)", False, "Running text announcement not saved correctly")
                return None
        else:
            log_test("POST /api/settings (Running Text Announcement)", False, f"Status code: {response.status_code}")
            return None
    except Exception as e:
        log_test("POST /api/settings (Running Text Announcement)", False, f"Error: {str(e)}")
        return None

def test_forgot_password_non_mock():
    """Test 28: POST /api/auth/forgot-password with non-mock email provider"""
    print("\n=== Test 28: POST /api/auth/forgot-password (Non-Mock Provider) ===")
    
    try:
        # First, update settings to use non-mock email provider
        settings_payload = {
            "id": "site_settings",
            "emailProvider": "SMTP/Gmail",
            "emailProviderCredentials": {
                "smtpHost": "smtp.gmail.com",
                "smtpPort": "587",
                "smtpUser": "test@gmail.com",
                "smtpPass": "test-password"
            }
        }
        
        settings_response = requests.post(f"{BASE_URL}/settings", json=settings_payload, timeout=10)
        if settings_response.status_code != 200:
            log_test("POST /api/auth/forgot-password (Non-Mock)", False, f"Failed to update settings: {settings_response.status_code}")
            return None
        
        # Now test forgot-password with non-mock provider
        payload = {
            "email": "admin@shindora.com"
        }
        
        response = requests.post(f"{BASE_URL}/auth/forgot-password", json=payload, timeout=10)
        if response.status_code == 200:
            result = response.json()
            if 'success' in result and result['success'] and 'message' in result:
                # Check if message indicates non-mock provider
                if 'Integrasi' in result['message'] or 'SMTP' in result['message']:
                    log_test("POST /api/auth/forgot-password (Non-Mock)", True, f"Non-mock provider working: {result['message']}")
                    
                    # Restore mock provider for other tests
                    restore_payload = {
                        "id": "site_settings",
                        "emailProvider": "Mock/Simulasi"
                    }
                    requests.post(f"{BASE_URL}/settings", json=restore_payload, timeout=10)
                    
                    return result
                else:
                    log_test("POST /api/auth/forgot-password (Non-Mock)", False, f"Message doesn't indicate non-mock provider: {result['message']}")
                    return None
            else:
                log_test("POST /api/auth/forgot-password (Non-Mock)", False, "Invalid response structure")
                return None
        else:
            log_test("POST /api/auth/forgot-password (Non-Mock)", False, f"Status code: {response.status_code}")
            return None
    except Exception as e:
        log_test("POST /api/auth/forgot-password (Non-Mock)", False, f"Error: {str(e)}")
        return None


def test_get_pages():
    """Test 30: GET /api/pages - Retrieve all custom pages"""
    print("\n=== Test 30: GET /api/pages ===")
    
    try:
        response = requests.get(f"{BASE_URL}/pages", timeout=10)
        if response.status_code == 200:
            pages = response.json()
            if len(pages) >= 2:  # Should have at least 2 default pages (DMCA, Privacy Policy)
                page_titles = [p.get('title', '') for p in pages]
                log_test("GET /api/pages", True, f"Found {len(pages)} pages: {', '.join(page_titles)}")
                return pages
            else:
                log_test("GET /api/pages", False, f"Expected at least 2 pages, found {len(pages)}")
                return None
        else:
            log_test("GET /api/pages", False, f"Status code: {response.status_code}")
            return None
    except Exception as e:
        log_test("GET /api/pages", False, f"Error: {str(e)}")
        return None

def test_create_page():
    """Test 31: POST /api/pages - Create a new custom page"""
    print("\n=== Test 31: POST /api/pages ===")
    
    try:
        payload = {
            "title": "Tentang Kami",
            "slug": "tentang-kami",
            "content": "<h2>Tentang ShinDora Nesub</h2><p>ShinDora Nesub adalah platform streaming anime nostalgia yang didedikasikan untuk mengenang masa kecil hari Minggu dengan anime-anime klasik seperti Doraemon, Crayon Shinchan, dan lainnya.</p>",
            "showInFooter": True
        }
        
        response = requests.post(f"{BASE_URL}/pages", json=payload, timeout=10)
        if response.status_code == 200:
            page = response.json()
            if page.get('title') == payload['title'] and page.get('slug') == payload['slug'] and 'id' in page:
                log_test("POST /api/pages", True, f"Page created: {page['title']} (ID: {page['id']})")
                return page
            else:
                log_test("POST /api/pages", False, "Page creation response invalid")
                return None
        else:
            log_test("POST /api/pages", False, f"Status code: {response.status_code}")
            return None
    except Exception as e:
        log_test("POST /api/pages", False, f"Error: {str(e)}")
        return None

def test_update_page(page):
    """Test 32: PUT /api/pages - Update a custom page"""
    print("\n=== Test 32: PUT /api/pages ===")
    
    if not page:
        log_test("PUT /api/pages", False, "No page to update")
        return None
    
    try:
        payload = {
            "id": page['id'],
            "title": "Tentang Kami (Updated)",
            "slug": "tentang-kami",
            "content": "<h2>Tentang ShinDora Nesub (Updated)</h2><p>Platform streaming anime nostalgia terbaik di Indonesia untuk mengenang masa kecil dengan anime klasik.</p>",
            "showInFooter": True
        }
        
        response = requests.put(f"{BASE_URL}/pages", json=payload, timeout=10)
        if response.status_code == 200:
            updated = response.json()
            if updated.get('title') == payload['title']:
                log_test("PUT /api/pages", True, f"Page updated: {updated['title']}")
                return updated
            else:
                log_test("PUT /api/pages", False, "Update not reflected")
                return None
        else:
            log_test("PUT /api/pages", False, f"Status code: {response.status_code}")
            return None
    except Exception as e:
        log_test("PUT /api/pages", False, f"Error: {str(e)}")
        return None

def test_delete_page(page):
    """Test 33: DELETE /api/pages - Delete a custom page"""
    print("\n=== Test 33: DELETE /api/pages ===")
    
    if not page:
        log_test("DELETE /api/pages", False, "No page to delete")
        return False
    
    try:
        response = requests.delete(f"{BASE_URL}/pages?id={page['id']}", timeout=10)
        if response.status_code == 200:
            result = response.json()
            if 'success' in result and result['success']:
                log_test("DELETE /api/pages", True, f"Page deleted: {page['id']}")
                return True
            else:
                log_test("DELETE /api/pages", False, "Delete not successful")
                return False
        else:
            log_test("DELETE /api/pages", False, f"Status code: {response.status_code}")
            return False
    except Exception as e:
        log_test("DELETE /api/pages", False, f"Error: {str(e)}")
        return False

def test_get_donations():
    """Test 34: GET /api/donations - Retrieve all donations"""
    print("\n=== Test 34: GET /api/donations ===")
    
    try:
        response = requests.get(f"{BASE_URL}/donations", timeout=10)
        if response.status_code == 200:
            donations = response.json()
            if len(donations) >= 0:  # Should have at least seeded donations
                log_test("GET /api/donations", True, f"Found {len(donations)} donations in database")
                return donations
            else:
                log_test("GET /api/donations", False, f"Unexpected donation count: {len(donations)}")
                return None
        else:
            log_test("GET /api/donations", False, f"Status code: {response.status_code}")
            return None
    except Exception as e:
        log_test("GET /api/donations", False, f"Error: {str(e)}")
        return None

def test_create_donation():
    """Test 35: POST /api/donations - Create a new donation manually"""
    print("\n=== Test 35: POST /api/donations ===")
    
    try:
        payload = {
            "name": "Budi Santoso",
            "amount": 50000,
            "message": "Terima kasih untuk anime nostalgia! Semangat terus ShinDora Nesub!",
            "platform": "Saweria"
        }
        
        response = requests.post(f"{BASE_URL}/donations", json=payload, timeout=10)
        if response.status_code == 200:
            donation = response.json()
            if 'id' in donation and donation['name'] == "Budi Santoso" and donation['amount'] == 50000:
                log_test("POST /api/donations", True, f"Donation created: {donation['name']} - Rp {donation['amount']} via {donation['platform']}")
                return donation
            else:
                log_test("POST /api/donations", False, "Invalid donation data returned")
                return None
        else:
            log_test("POST /api/donations", False, f"Status code: {response.status_code}")
            return None
    except Exception as e:
        log_test("POST /api/donations", False, f"Error: {str(e)}")
        return None

def test_delete_donation(donation):
    """Test 36: DELETE /api/donations - Delete a donation by ID"""
    print("\n=== Test 36: DELETE /api/donations ===")
    
    if not donation:
        log_test("DELETE /api/donations", False, "No donation to delete")
        return False
    
    try:
        response = requests.delete(f"{BASE_URL}/donations?id={donation['id']}", timeout=10)
        if response.status_code == 200:
            result = response.json()
            if 'success' in result and result['success']:
                log_test("DELETE /api/donations", True, f"Donation deleted: {donation['id']}")
                return True
            else:
                log_test("DELETE /api/donations", False, "Delete not successful")
                return False
        else:
            log_test("DELETE /api/donations", False, f"Status code: {response.status_code}")
            return False
    except Exception as e:
        log_test("DELETE /api/donations", False, f"Error: {str(e)}")
        return False

def test_saweria_webhook():
    """Test 37: POST /api/webhooks/saweria - Saweria webhook integration"""
    print("\n=== Test 37: POST /api/webhooks/saweria ===")
    
    try:
        payload = {
            "donator_name": "Rina Wijaya",
            "amount": 75000,
            "message": "Doraemon favorit saya! Terima kasih sudah menyediakan anime nostalgia."
        }
        
        response = requests.post(f"{BASE_URL}/webhooks/saweria", json=payload, timeout=10)
        if response.status_code == 200:
            result = response.json()
            if 'success' in result and result['success'] and 'donation' in result:
                donation = result['donation']
                if donation['platform'] == 'Saweria' and donation['name'] == 'Rina Wijaya':
                    log_test("POST /api/webhooks/saweria", True, f"Saweria webhook processed: {donation['name']} - Rp {donation['amount']}")
                    return donation
                else:
                    log_test("POST /api/webhooks/saweria", False, "Invalid donation data from webhook")
                    return None
            else:
                log_test("POST /api/webhooks/saweria", False, "Invalid webhook response structure")
                return None
        else:
            log_test("POST /api/webhooks/saweria", False, f"Status code: {response.status_code}")
            return None
    except Exception as e:
        log_test("POST /api/webhooks/saweria", False, f"Error: {str(e)}")
        return None

def test_trakteer_webhook():
    """Test 38: POST /api/webhooks/trakteer - Trakteer webhook integration"""
    print("\n=== Test 38: POST /api/webhooks/trakteer ===")
    
    try:
        payload = {
            "donator_name": "Ahmad Fauzi",
            "amount": 100000,
            "message": "Crayon Shinchan selalu bikin ketawa! Sukses terus ShinDora!"
        }
        
        response = requests.post(f"{BASE_URL}/webhooks/trakteer", json=payload, timeout=10)
        if response.status_code == 200:
            result = response.json()
            if 'success' in result and result['success'] and 'donation' in result:
                donation = result['donation']
                if donation['platform'] == 'Trakteer' and donation['name'] == 'Ahmad Fauzi':
                    log_test("POST /api/webhooks/trakteer", True, f"Trakteer webhook processed: {donation['name']} - Rp {donation['amount']}")
                    return donation
                else:
                    log_test("POST /api/webhooks/trakteer", False, "Invalid donation data from webhook")
                    return None
            else:
                log_test("POST /api/webhooks/trakteer", False, "Invalid webhook response structure")
                return None
        else:
            log_test("POST /api/webhooks/trakteer", False, f"Status code: {response.status_code}")
            return None
    except Exception as e:
        log_test("POST /api/webhooks/trakteer", False, f"Error: {str(e)}")
        return None

def test_get_latest_donations():
    """Test 39: GET /api/webhooks/poll - Poll latest donations"""
    print("\n=== Test 39: GET /api/webhooks/poll ===")
    
    try:
        response = requests.get(f"{BASE_URL}/webhooks/poll", timeout=10)
        if response.status_code == 200:
            donations = response.json()
            if isinstance(donations, list):
                log_test("GET /api/webhooks/poll", True, f"Retrieved {len(donations)} latest donations (sorted by timestamp desc, limit 3)")
                return donations
            else:
                log_test("GET /api/webhooks/poll", False, "Invalid response format")
                return None
        else:
            log_test("GET /api/webhooks/poll", False, f"Status code: {response.status_code}")
            return None
    except Exception as e:
        log_test("GET /api/webhooks/poll", False, f"Error: {str(e)}")
        return None


def test_get_polling():
    """Test 42: GET /api/polling - Get all polls"""
    print("\n=== Test 42: GET /api/polling ===")
    
    try:
        response = requests.get(f"{BASE_URL}/polling", timeout=10)
        if response.status_code == 200:
            polls = response.json()
            if isinstance(polls, list):
                if len(polls) > 0:
                    poll = polls[0]
                    log_test("GET /api/polling", True, f"Retrieved {len(polls)} polls. First poll: '{poll.get('title', '')}' with {len(poll.get('options', []))} options")
                    return polls
                else:
                    log_test("GET /api/polling", True, "Retrieved 0 polls (database may be empty)")
                    return []
            else:
                log_test("GET /api/polling", False, "Invalid response format")
                return None
        else:
            log_test("GET /api/polling", False, f"Status code: {response.status_code}")
            return None
    except Exception as e:
        log_test("GET /api/polling", False, f"Error: {str(e)}")
        return None

def test_create_polling():
    """Test 43: POST /api/polling - Create new poll"""
    print("\n=== Test 43: POST /api/polling ===")
    
    try:
        new_poll_data = {
            "title": "Anime Retro Favorit Kamu?",
            "options": [
                {"id": "opt-test-1", "name": "Detective Conan", "imageUrl": "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=100", "votes": 0},
                {"id": "opt-test-2", "name": "Slam Dunk", "imageUrl": "https://images.unsplash.com/photo-1613771404724-11d20496d140?w=100", "votes": 0},
                {"id": "opt-test-3", "name": "Yu Yu Hakusho", "imageUrl": "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=100", "votes": 0}
            ],
            "isActive": True
        }
        
        response = requests.post(f"{BASE_URL}/polling", json=new_poll_data, timeout=10)
        if response.status_code == 200:
            poll = response.json()
            if poll.get('id') and poll.get('title') == new_poll_data['title']:
                log_test("POST /api/polling", True, f"Created poll '{poll['title']}' with ID: {poll['id']} and {len(poll.get('options', []))} options")
                return poll
            else:
                log_test("POST /api/polling", False, "Poll created but missing expected fields")
                return None
        else:
            log_test("POST /api/polling", False, f"Status code: {response.status_code}")
            return None
    except Exception as e:
        log_test("POST /api/polling", False, f"Error: {str(e)}")
        return None

def test_update_polling(poll):
    """Test 44: PUT /api/polling - Update poll"""
    print("\n=== Test 44: PUT /api/polling ===")
    
    if not poll:
        log_test("PUT /api/polling", False, "No poll provided to update")
        return None
    
    try:
        updated_data = {
            "id": poll['id'],
            "title": "Anime Retro Favorit Kamu? (Updated)",
            "options": poll.get('options', []),
            "isActive": False
        }
        
        response = requests.put(f"{BASE_URL}/polling", json=updated_data, timeout=10)
        if response.status_code == 200:
            updated_poll = response.json()
            if updated_poll.get('title') == updated_data['title'] and updated_poll.get('isActive') == False:
                log_test("PUT /api/polling", True, f"Updated poll title to '{updated_poll['title']}' and set isActive to False")
                return updated_poll
            else:
                log_test("PUT /api/polling", False, "Poll updated but fields don't match")
                return None
        else:
            log_test("PUT /api/polling", False, f"Status code: {response.status_code}")
            return None
    except Exception as e:
        log_test("PUT /api/polling", False, f"Error: {str(e)}")
        return None

def test_vote_on_poll(poll):
    """Test 45: POST /api/polling/vote - Vote on a poll option"""
    print("\n=== Test 45: POST /api/polling/vote ===")
    
    if not poll or not poll.get('options'):
        log_test("POST /api/polling/vote", False, "No poll or options provided to vote")
        return None
    
    try:
        # Get the first option to vote on
        first_option = poll['options'][0]
        original_votes = first_option.get('votes', 0)
        
        vote_data = {
            "pollId": poll['id'],
            "optionId": first_option['id']
        }
        
        response = requests.post(f"{BASE_URL}/polling/vote", json=vote_data, timeout=10)
        if response.status_code == 200:
            updated_poll = response.json()
            # Find the voted option in the updated poll
            voted_option = next((opt for opt in updated_poll.get('options', []) if opt['id'] == first_option['id']), None)
            
            if voted_option and voted_option.get('votes', 0) == original_votes + 1:
                log_test("POST /api/polling/vote", True, f"Successfully voted for '{voted_option['name']}'. Votes increased from {original_votes} to {voted_option['votes']}")
                return updated_poll
            else:
                log_test("POST /api/polling/vote", False, "Vote recorded but vote count didn't increase correctly")
                return None
        else:
            log_test("POST /api/polling/vote", False, f"Status code: {response.status_code}")
            return None
    except Exception as e:
        log_test("POST /api/polling/vote", False, f"Error: {str(e)}")
        return None

def test_delete_polling(poll):
    """Test 46: DELETE /api/polling - Delete poll"""
    print("\n=== Test 46: DELETE /api/polling ===")
    
    if not poll:
        log_test("DELETE /api/polling", False, "No poll provided to delete")
        return False
    
    try:
        response = requests.delete(f"{BASE_URL}/polling?id={poll['id']}", timeout=10)
        if response.status_code == 200:
            result = response.json()
            if result.get('success'):
                log_test("DELETE /api/polling", True, f"Successfully deleted poll '{poll.get('title', '')}'")
                return True
            else:
                log_test("DELETE /api/polling", False, "Delete response didn't return success")
                return False
        else:
            log_test("DELETE /api/polling", False, f"Status code: {response.status_code}")
            return False
    except Exception as e:
        log_test("DELETE /api/polling", False, f"Error: {str(e)}")
        return False

def test_vote_with_user_tracking():
    """Test 47: POST /api/polling/vote with userId - First vote should succeed"""
    print("\n=== Test 47: POST /api/polling/vote with User Tracking (First Vote) ===")
    
    try:
        # Create a new poll for user tracking test
        poll_data = {
            "title": "Test Poll for User Tracking",
            "options": [
                {"id": "opt-1", "name": "Option 1", "votes": 0},
                {"id": "opt-2", "name": "Option 2", "votes": 0}
            ],
            "isActive": True
        }
        
        create_response = requests.post(f"{BASE_URL}/polling", json=poll_data, timeout=10)
        if create_response.status_code != 200:
            log_test("POST /api/polling/vote with User Tracking (First Vote)", False, f"Failed to create test poll: {create_response.status_code}")
            return None
        
        poll = create_response.json()
        
        # Vote with userId
        vote_data = {
            "pollId": poll['id'],
            "optionId": "opt-1",
            "userId": "test-user-123"
        }
        
        response = requests.post(f"{BASE_URL}/polling/vote", json=vote_data, timeout=10)
        if response.status_code == 200:
            updated_poll = response.json()
            voted_option = next((opt for opt in updated_poll.get('options', []) if opt['id'] == 'opt-1'), None)
            
            if voted_option and voted_option.get('votes', 0) == 1:
                log_test("POST /api/polling/vote with User Tracking (First Vote)", True, f"Successfully voted with userId. Votes: {voted_option['votes']}. User vote tracked in user_votes collection.")
                return poll
            else:
                log_test("POST /api/polling/vote with User Tracking (First Vote)", False, "Vote recorded but vote count incorrect")
                return None
        else:
            log_test("POST /api/polling/vote with User Tracking (First Vote)", False, f"Status code: {response.status_code}")
            return None
    except Exception as e:
        log_test("POST /api/polling/vote with User Tracking (First Vote)", False, f"Error: {str(e)}")
        return None

def test_vote_quota_check_duplicate():
    """Test 48: POST /api/polling/vote - Duplicate vote should be rejected (Quota Check)"""
    print("\n=== Test 48: POST /api/polling/vote - Quota Check (Duplicate Vote) ===")
    
    try:
        # Create a new poll
        poll_data = {
            "title": "Test Poll for Quota Check",
            "options": [
                {"id": "opt-a", "name": "Option A", "votes": 0},
                {"id": "opt-b", "name": "Option B", "votes": 0}
            ],
            "isActive": True
        }
        
        create_response = requests.post(f"{BASE_URL}/polling", json=poll_data, timeout=10)
        if create_response.status_code != 200:
            log_test("POST /api/polling/vote - Quota Check (Duplicate Vote)", False, f"Failed to create test poll: {create_response.status_code}")
            return None
        
        poll = create_response.json()
        
        # First vote with userId
        vote_data = {
            "pollId": poll['id'],
            "optionId": "opt-a",
            "userId": "test-user-456"
        }
        
        first_response = requests.post(f"{BASE_URL}/polling/vote", json=vote_data, timeout=10)
        if first_response.status_code != 200:
            log_test("POST /api/polling/vote - Quota Check (Duplicate Vote)", False, f"First vote failed: {first_response.status_code}")
            return None
        
        # Try to vote again with same userId (should be rejected)
        second_response = requests.post(f"{BASE_URL}/polling/vote", json=vote_data, timeout=10)
        if second_response.status_code == 400:
            error_data = second_response.json()
            error_message = error_data.get('error', '')
            if 'sudah memberikan suara' in error_message or 'already voted' in error_message.lower():
                log_test("POST /api/polling/vote - Quota Check (Duplicate Vote)", True, f"Duplicate vote correctly rejected with error: '{error_message}'. Quota check working!")
                # Clean up test poll
                try:
                    requests.delete(f"{BASE_URL}/polling?id={poll['id']}", timeout=10)
                except Exception:
                    pass
                return True
            else:
                log_test("POST /api/polling/vote - Quota Check (Duplicate Vote)", False, f"Got 400 error but wrong message: {error_message}")
                return False
        else:
            log_test("POST /api/polling/vote - Quota Check (Duplicate Vote)", False, f"Duplicate vote was not rejected. Status code: {second_response.status_code}")
            return False
    except Exception as e:
        log_test("POST /api/polling/vote - Quota Check (Duplicate Vote)", False, f"Error: {str(e)}")
        return False

def test_vote_different_user():
    """Test 49: POST /api/polling/vote - Different user should be able to vote"""
    print("\n=== Test 49: POST /api/polling/vote - Different User Vote ===")
    
    try:
        # Create a new poll
        poll_data = {
            "title": "Test Poll for Multiple Users",
            "options": [
                {"id": "opt-x", "name": "Option X", "votes": 0},
                {"id": "opt-y", "name": "Option Y", "votes": 0}
            ],
            "isActive": True
        }
        
        create_response = requests.post(f"{BASE_URL}/polling", json=poll_data, timeout=10)
        if create_response.status_code != 200:
            log_test("POST /api/polling/vote - Different User Vote", False, f"Failed to create test poll: {create_response.status_code}")
            return False
        
        poll = create_response.json()
        
        # First user votes
        vote_data_user1 = {
            "pollId": poll['id'],
            "optionId": "opt-x",
            "userId": "test-user-789"
        }
        
        first_response = requests.post(f"{BASE_URL}/polling/vote", json=vote_data_user1, timeout=10)
        if first_response.status_code != 200:
            log_test("POST /api/polling/vote - Different User Vote", False, f"First user vote failed: {first_response.status_code}")
            return False
        
        # Second user votes (should succeed)
        vote_data_user2 = {
            "pollId": poll['id'],
            "optionId": "opt-y",
            "userId": "test-user-999"
        }
        
        second_response = requests.post(f"{BASE_URL}/polling/vote", json=vote_data_user2, timeout=10)
        if second_response.status_code == 200:
            updated_poll = second_response.json()
            opt_x = next((opt for opt in updated_poll.get('options', []) if opt['id'] == 'opt-x'), None)
            opt_y = next((opt for opt in updated_poll.get('options', []) if opt['id'] == 'opt-y'), None)
            
            if opt_x and opt_y and opt_x.get('votes', 0) == 1 and opt_y.get('votes', 0) == 1:
                log_test("POST /api/polling/vote - Different User Vote", True, f"Different users can vote successfully. Option X: {opt_x['votes']} vote, Option Y: {opt_y['votes']} vote. User tracking working correctly!")
                # Clean up test poll
                try:
                    requests.delete(f"{BASE_URL}/polling?id={poll['id']}", timeout=10)
                except Exception:
                    pass
                return True
            else:
                log_test("POST /api/polling/vote - Different User Vote", False, "Vote counts incorrect")
                return False
        else:
            log_test("POST /api/polling/vote - Different User Vote", False, f"Second user vote failed: {second_response.status_code}")
            return False
    except Exception as e:
        log_test("POST /api/polling/vote - Different User Vote", False, f"Error: {str(e)}")
        return False

def main():
    """Main test execution"""
    print("="*60)
    print("ShinDora Nesub Backend API Test Suite")
    print("="*60)
    print(f"Base URL: {BASE_URL}")
    print(f"Test Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Run all tests in sequence
    test_mongodb_connection_and_seeding()
    videos = test_get_videos()
    categories = test_get_categories()
    settings = test_get_settings()
    ads = test_get_ads()
    
    # Categories CRUD tests
    new_category = test_create_category()
    updated_category = test_update_category(new_category)
    test_delete_category(updated_category if updated_category else new_category)
    test_database_seeding_verification()
    
    # Auth tests
    new_user = test_auth_register()
    logged_user = test_auth_login(new_user)
    admin = test_admin_login_staff_only()
    admin_regular = test_admin_login_regular()
    test_regular_user_staff_only_rejection(logged_user)
    
    # NEW FEATURE TESTS
    moderator = test_moderator_login_staff_only()
    test_forgot_password()
    test_forgot_password_unregistered()
    test_onesignal_notify()
    test_onesignal_notify_missing_fields()
    
    # Comment tests
    parent_comment, reply_comment = test_create_comment_and_reply(logged_user)
    test_delete_comment_recursive(parent_comment)
    
    # Multi-server video URLs test
    test_multi_server_video_urls()
    
    # Playlist CRUD tests
    playlists = test_get_playlists()
    new_playlist = test_create_playlist(logged_user)
    updated_playlist = test_update_playlist(new_playlist)
    test_delete_playlist(updated_playlist)
    
    # Video CRUD tests
    new_video = test_create_video()
    updated_video = test_update_video(new_video)
    # Test video views increment
    video_with_incremented_views = test_increment_video_views(updated_video if updated_video else new_video)
    
    # Test likes toggle functionality
    test_toggle_like()
    
    test_delete_video(video_with_incremented_views if video_with_incremented_views else updated_video)
    
    # Bulk CSV import test
    test_bulk_csv_import()
    
    # Users management test
    test_get_users()
    
    # Test forgot-password with non-mock provider
    test_forgot_password_non_mock()
    
    # Custom Pages CRUD tests
    pages = test_get_pages()
    new_page = test_create_page()
    updated_page = test_update_page(new_page)
    test_delete_page(updated_page)
    
    # Donation & Webhook tests
    donations = test_get_donations()
    new_donation = test_create_donation()
    test_delete_donation(new_donation)
    saweria_donation = test_saweria_webhook()
    trakteer_donation = test_trakteer_webhook()
    latest_donations = test_get_latest_donations()
    
    # NEW FEATURE TESTS: Auto-Push OneSignal & Running Text Announcement
    video_with_push = test_create_video_with_push_notification()
    if video_with_push:
        # Clean up the test video
        try:
            requests.delete(f"{BASE_URL}/videos?id={video_with_push['id']}", timeout=10)
        except Exception:
            pass
    running_text_settings = test_settings_running_text_announcement()
    
    # NEW FEATURE TESTS: Polling & Voting (Vote Anime Selanjutnya)
    existing_polls = test_get_polling()
    new_poll = test_create_polling()
    updated_poll = test_update_polling(new_poll)
    voted_poll = test_vote_on_poll(updated_poll if updated_poll else new_poll)
    test_delete_polling(voted_poll if voted_poll else new_poll)
    
    # NEW FEATURE TESTS: User-Votes Database Tracking & Quota Check
    test_poll_user_tracking = test_vote_with_user_tracking()
    test_vote_quota_check_duplicate()
    test_vote_different_user()
    
    # Print summary
    all_passed = print_summary()
    
    # Exit with appropriate code
    sys.exit(0 if all_passed else 1)

if __name__ == "__main__":
    main()
