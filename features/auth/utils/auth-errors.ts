
import type { AuthError } from "../stores/auth.slice";

type MappedAuthErrorCode =
  | "invalid_credentials"
  | "user_not_found"
  | "email_already_in_use"
  | "weak_password"
  | "network_error"
  | "unknown";

export interface MappedAuthError {
  code: MappedAuthErrorCode;
  message: string;
}

/**
 * Nhận lỗi thô từ auth (backend hoặc mock) và trả về message cho UI.
 * Trong mock hiện tại chỉ có { message }, sau này có thể mở rộng thêm code.
 */
export function mapAuthError(error: AuthError): MappedAuthError {
  const raw = (error?.message || "").toLowerCase().trim();

  // Tùy backend, bạn chỉnh các case này cho khớp:
  if (
    raw.includes("invalid login") ||
    raw.includes("invalid credentials") ||
    raw.includes("wrong password") ||
    raw.includes("invalid email or password")
  ) {
    return {
      code: "invalid_credentials",
      message: "Email hoặc mật khẩu không chính xác. Vui lòng thử lại.",
    };
  }

  if (raw.includes("user not found") || raw.includes("no user record")) {
    return {
      code: "user_not_found",
      message: "Tài khoản không tồn tại. Vui lòng kiểm tra lại email.",
    };
  }

  if (
    raw.includes("email already in use") ||
    raw.includes("email_exists") ||
    raw.includes("duplicate email")
  ) {
    return {
      code: "email_already_in_use",
      message: "Email này đã được sử dụng. Vui lòng dùng email khác.",
    };
  }

  if (raw.includes("weak password") || raw.includes("password is too short")) {
    return {
      code: "weak_password",
      message: "Mật khẩu quá yếu. Vui lòng chọn mật khẩu mạnh hơn.",
    };
  }

  if (
    raw.includes("network error") ||
    raw.includes("timeout") ||
    raw.includes("failed to fetch")
  ) {
    return {
      code: "network_error",
      message:
        "Không thể kết nối tới máy chủ. Vui lòng kiểm tra mạng và thử lại.",
    };
  }

  // Mặc định
  return {
    code: "unknown",
    message: error?.message || "Đã xảy ra lỗi không xác định. Vui lòng thử lại.",
  };
}
