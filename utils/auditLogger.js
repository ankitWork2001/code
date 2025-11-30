  // utils/auditLogger.js
import { AuditLog } from "../models/Audit.js";

/**
 * Write an audit log entry.
 * @param {String|ObjectId} actor - user id (or 'system')
 * @param {String} action - action key e.g. "status_change"
 * @param {String} targetType - e.g. "Request"
 * @param {String|ObjectId} targetId
 * @param {Object} details - optional extra details
 */
export async function logAudit(actor, action, targetType, targetId, details = {}) {
  try {
    const entry = new AuditLog({
      actor,
      action,
      targetType,
      targetId,
      details,
      createdAt: new Date()
    });
    await entry.save();
  } catch (err) {
    // don't throw - auditing should not break workflows; optionally log
    console.error("Audit log failed:", err);
  }
}
