/**
 * Domain types and DTOs for the shoe-repair-quotation API.
 *
 * All interfaces are exported as named exports for use across the
 * HTTP, service, and repository layers.
 */

/**
 * Represents a shoe type registered in the catalog.
 */
export interface ShoeType {
  /** Unique identifier for the shoe type (e.g. "st-1"). */
  id: string;

  /** Human-readable name of the shoe type (e.g. "Zapatilla deportiva"). */
  name: string;

  /**
   * Multiplier applied to every repair's base price when calculating the
   * quotation subtotal.
   * Must be a positive number greater than 0.
   */
  complexityFactor: number;
}

/**
 * Represents a repair service registered in the catalog.
 */
export interface Repair {
  /** Unique identifier for the repair (e.g. "r-1"). */
  id: string;

  /** Human-readable name of the repair (e.g. "Cambio de suela"). */
  name: string;

  /**
   * Base price for this repair in local currency units.
   * Must be a positive number greater than 0.
   */
  basePrice: number;

  /**
   * Estimated number of working days required to complete this repair.
   * Must be a positive integer greater than or equal to 1.
   */
  estimatedDays: number;
}

/**
 * A generated quotation returned by POST /quotations.
 */
export interface Quotation {
  /**
   * Unique identifier for this quotation.
   * Format: UUID v4 (e.g. "550e8400-e29b-41d4-a716-446655440000").
   */
  id: string;

  /**
   * Timestamp at which the quotation was created.
   * Format: ISO 8601 date-time string (e.g. "2024-06-15T10:30:00.000Z").
   */
  createdAt: string;

  /** The ID of the shoe type used to calculate this quotation. */
  shoeTypeId: string;

  /**
   * The IDs of the repairs included in this quotation.
   * Contains at least one element.
   */
  repairIds: string[];

  /**
   * Sum of (repair.basePrice × shoeType.complexityFactor) for all repairs.
   * Calculated as: Σᵢ (pᵢ × f).
   */
  subtotal: number;

  /**
   * Urgency surcharge applied on top of the subtotal.
   * Equals subtotal × 0.30 when urgent is true; 0 when urgent is false.
   */
  surcharge: number;

  /**
   * Final price charged to the customer.
   * Equals subtotal + surcharge.
   */
  total: number;

  /**
   * Estimated number of working days to complete all requested repairs.
   * When urgent is false: equals max(repair.estimatedDays).
   * When urgent is true: equals max(1, ceil(max(repair.estimatedDays) / 2)).
   * Always an integer greater than or equal to 1.
   */
  estimatedDays: number;

  /**
   * Whether the quotation was requested as urgent.
   * Affects both the price (surcharge) and the estimated delivery time.
   */
  urgent: boolean;
}

/**
 * Request body for POST /quotations.
 */
export interface QuotationRequest {
  /** The ID of the shoe type to include in the quotation. Must exist in the catalog. */
  shoeTypeId: string;

  /**
   * IDs of the repairs to include in the quotation.
   * Must be a non-empty array; every ID must exist in the catalog.
   */
  repairIds: string[];

  /**
   * Whether the customer requests urgent processing.
   * When true, a 30 % surcharge is applied and delivery time is halved (minimum 1 day).
   */
  urgent: boolean;
}

/**
 * Standard error response returned by the API on 4xx and 5xx responses.
 */
export interface ErrorResponse {
  /** Short human-readable description of the error. */
  error: string;

  /**
   * Optional list of additional details about the error.
   * Used when multiple issues need to be reported simultaneously
   * (e.g. several repair IDs not found).
   */
  details?: string[];
}
