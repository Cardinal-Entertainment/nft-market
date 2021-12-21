export const waitForTransaction = async (tx) => {
    try {
        await tx.wait();
    } catch (e) {
        /**
         * If the error code is transaction replaced, it's likely that the user just sped it up.
         * In that case we don't want to throw so the next calls can proceed.
         */
        if (e.code !== "TRANSACTION_REPLACED") {
            throw e;
        }
    }
}
