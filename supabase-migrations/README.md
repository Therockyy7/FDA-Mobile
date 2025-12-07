# Database Migrations

## Quy ước Migration

Tất cả migration files được đặt tên theo format: `{number}_{description}.sql`

- **Number**: 3 chữ số, bắt đầu từ 001
- **Description**: Mô tả ngắn gọn bằng tiếng Anh, sử dụng snake_case
- **Extension**: `.sql`

## Thứ tự Migration

Chạy các migration theo thứ tự số từ nhỏ đến lớn:

### 001_create_notes_table.sql
- Tạo bảng `notes` cơ bản
- Tạo RLS policies cho notes
- **Phụ thuộc**: Không có

### 002_create_user_profiles_table.sql  
- Tạo bảng `user_profiles`
- Tạo trigger tự động tạo profile khi user đăng ký
- **Phụ thuộc**: auth.users (có sẵn trong Supabase)

### 003_create_activities_table.sql
- Tạo bảng `activities` để track các hoạt động của user
- Tạo RLS policies và indexes
- **Phụ thuộc**: auth.users

### 004_add_categories_to_notes.sql
- Thêm các cột mới vào bảng `notes`: category, tags, is_favorite, color
- Tạo indexes cho performance
- **Phụ thuộc**: 001_create_notes_table.sql

## Cách chạy Migration

### Sử dụng Supabase CLI (Khuyến nghị)
```bash
# Chạy tất cả migrations
supabase db reset

# Hoặc chạy từng migration
supabase db push
```

### Chạy thủ công qua Supabase Dashboard
1. Vào Supabase Dashboard → SQL Editor
2. Copy nội dung file migration theo thứ tự
3. Run từng migration một cách tuần tự

## Lưu ý quan trọng

⚠️ **LUÔN CHẠY THEO THỨ TỰ**: Không được skip migration hoặc chạy không đúng thứ tự

⚠️ **BACKUP TRƯỚC KHI CHẠY**: Luôn backup database trước khi apply migration mới

⚠️ **KIỂM TRA DEPENDENCIES**: Đảm bảo các migration dependency đã được chạy

## Tạo Migration mới

Khi tạo migration mới:

1. Đặt tên theo format `{next_number}_{description}.sql`
2. Thêm comment mô tả mục đích của migration
3. Cập nhật file README này
4. Test migration trên development environment trước

## Status Migration hiện tại

- ✅ 001_create_notes_table.sql - Cơ bản notes
- ✅ 002_create_user_profiles_table.sql - User profiles  
- ✅ 003_create_activities_table.sql - Activity tracking
- ✅ 004_add_categories_to_notes.sql - Notes enhancement

## Schema hiện tại

Sau khi chạy tất cả migrations, database sẽ có:

### Tables
- `notes` - Ghi chú với categories, tags, favorites
- `activities` - Lịch sử hoạt động  
- `user_profiles` - Thông tin user mở rộng
- `auth.users` - Supabase auth (có sẵn)

### Features
- Row Level Security (RLS) cho tất cả tables
- Auto-create user profile on signup
- Activity tracking cho note actions
- Advanced search với categories và tags