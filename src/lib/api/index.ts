/**
 * API Module - Export tất cả các hàm từ services.ts
 *
 * File này giúp đơn giản hóa việc import các hàm API trong codebase.
 * Thay vì import từ '@/lib/api/services', có thể import từ '@/lib/api'.
 *
 * LƯU Ý QUAN TRỌNG:
 * - Khi import từ '@/lib/api', bạn đang import từ SERVICE LAYER, không phải CLIENT LAYER
 * - Service layer chịu trách nhiệm xử lý business logic, chuyển đổi dữ liệu, caching, v.v.
 * - Client layer (trong './client.ts') chịu trách nhiệm gọi API thực tế
 * - Các component nên sử dụng service layer, không nên gọi trực tiếp client layer
 */

export * from './services';
