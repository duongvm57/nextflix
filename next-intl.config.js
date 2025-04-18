// Cấu hình next-intl
module.exports = {
  // Vì chúng ta chỉ sử dụng tiếng Việt, không cần cấu hình locales
  locales: ['vi'],
  defaultLocale: 'vi',
  // Không sử dụng locale trong URL
  localePrefix: 'never',
  // Tắt tính năng phát hiện locale
  localeDetection: false
};
