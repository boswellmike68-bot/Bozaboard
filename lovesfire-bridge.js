// Lovesfire HTTP Bridge
// Connects Bozaboard UI to the lovesfire-ai local server (http://localhost:3000)

const LOVESFIRE_API = "http://localhost:3000";

/**
 * Send user input to lovesfire-ai server for governance processing
 * @param {string} userInput - The user's message/command
 * @returns {Promise<{success: boolean, message: string, voice?: string, session?: any, error?: string}>}
 */
export async function sendToLovesfire(userInput) {
  try {
    const response = await fetch(`${LOVESFIRE_API}/advisory`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ input: userInput }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        message: errorData.error || `Server error: ${response.status}`,
        error: errorData.error || `HTTP ${response.status}`,
      };
    }

    const data = await response.json();

    // lovesfire-ai /advisory returns: { success, message, governanceStamp, specVersion, sceneCount, warnings }
    return {
      success: data.success !== false,
      message: data.message || "Advisory processed.",
      governanceStamp: data.governanceStamp,
      specVersion: data.specVersion,
      sceneCount: data.sceneCount,
      warnings: data.warnings || [],
    };
  } catch (err) {
    return {
      success: false,
      message: "Unable to connect to lovesfire-ai server. Is it running on http://localhost:3000?",
      error: err.message,
    };
  }
}

/**
 * Poll job status from lovesfire-ai server
 * @param {string} jobId - The job ID returned from /render
 * @returns {Promise<{status: string, progress?: number, error?: string, result?: any}>}
 */
export async function pollJobStatus(jobId) {
  try {
    const response = await fetch(`${LOVESFIRE_API}/status/${jobId}`);
    
    if (!response.ok) {
      return { status: "error", error: `HTTP ${response.status}` };
    }

    const data = await response.json();
    return data;
  } catch (err) {
    return { status: "error", error: err.message };
  }
}

/**
 * Get server stats (for debugging/monitoring)
 * @returns {Promise<any>}
 */
export async function getServerStats() {
  try {
    const response = await fetch(`${LOVESFIRE_API}/stats`);
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}
