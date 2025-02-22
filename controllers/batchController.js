
import db from '../config/database.js'; // Assuming your DB connection is set up correctly
import express from 'express';
const router = express.Router();  // Correcting the router initialization

// Create batch
export const createBatch = async (req, res, next) => {
    const { batchName } = req.body;
    const startDate = new Date(); // Batch starts today

    try {
        const [result] = await db.execute('INSERT INTO Batch (batch_name, start_date, is_active) VALUES (?, ?, ?)', 
        [batchName, startDate, true]);
        res.status(200).json({ batchId: result.insertId });
    } catch (err) {
        const error = new Error(`Unable to create batch`);
        error.status = 500;
        next(error);  // Pass the error to the next middleware but do not send a response
    }
};

// Close batch
export const closeBatch = async (req, res, next) => {
    const { batchId } = req.body;
    const endDate = new Date(); // Batch closes today

    try {
        await db.execute('UPDATE Batch SET is_active = false, end_date = ? WHERE batch_id = ?', 
        [endDate, batchId]);  // Update the column name to 'batch_id'
        res.status(200).send('Batch closed');
    } catch (err) {
        const error = new Error(`Unable to close batch`);
        error.status = 500;
        next(error);  // Pass the error to the next middleware but do not send a response
    }
}


// Fetch the last active batch
export const getLastActiveBatch = async (req, res, next) => {
    try {
        const [batch] = await db.execute('SELECT batch_id, batch_name FROM batch WHERE is_active = true ORDER BY start_date DESC LIMIT 1');
        console.log("fgh" , batch);
        if (batch.length > 0) {
            const { batch_id, batch_name } = batch[0];
            console.log("fetch" , batch_id, batch_name);
            res.status(200).json({ batchId: batch_id, batchName: batch_name });
        } else {
            res.status(404).json({ message: 'No active batch found' });
            console.log("qwe");
        }
        
    } catch (err) {
        const error = new Error('Unable to fetch the last active batch');
        error.status = 500;
        next(error); 
    }
};





// Fetch closed batches (inactive batches with a non-NULL end_date)
// Fetch closed batches (inactive batches with a non-NULL end_date) and their corresponding transactions

// export const getInactiveBatches = async (req, res, next) => {
//     try {
//         // Query to fetch batches where end_date is not NULL
//         const [batches] = await db.execute('SELECT batch_id, start_date, end_date FROM batch WHERE end_date IS NOT NULL');
//         console.log("batches value", batches);

//         if (batches.length > 0) {
//             // Extract batch IDs
//             const batchIds = batches.map(batch => batch.batch_id);
//             console.log("ids", batchIds);

//             // Dynamically generate placeholders for the IN clause
//             const placeholders = batchIds.map(() => '?').join(',');
//             const query = `SELECT * FROM transactions WHERE batch_id IN (${placeholders})`;

//             // Fetch transactions for the fetched batch IDs
//             const [transactions] = await db.execute(query, batchIds);
//             console.log("transac", transactions);

//             // Combine batches and their corresponding transactions
//             const batchesWithTransactions = batches.map(batch => {
//                 const batchTransactions = transactions.filter(transaction => transaction.batch_id === batch.batch_id);
//                 return { ...batch, transactions: batchTransactions };
//             });

//             res.status(200).json(batchesWithTransactions); // Send back the batches with their transactions
//         } else {
//             res.status(404).json({ message: 'No closed batches found.' });
//         }
//     } catch (err) {
//         console.error('Error fetching inactive batches:', err); // Log the actual error for debugging
//         const error = new Error('Unable to fetch inactive batches');
//         error.status = 500;
//         next(error); // Pass the error to the next middleware
//     }
// };




// export const getInactiveBatches = async (req, res, next) => {
//     try {
//         // Query to fetch batches and their transactions in one go
//         const [results] = await db.execute(`
//             SELECT b.batch_id, b.start_date, b.end_date, t.* 
//             FROM batch b
//             LEFT JOIN transactions t ON b.batch_id = t.batch_id
//             WHERE b.end_date IS NOT NULL
//         `);
//         console.log("results", results);

//         if (results.length > 0) {
//             // Group transactions by batch_id
//             const batchesWithTransactions = results.reduce((acc, row) => {
//                 if (!acc[row.batch_id]) {
//                     acc[row.batch_id] = {
//                         batch_id: row.batch_id,
//                         start_date: row.start_date,
//                         end_date: row.end_date,
//                         transactions: []
//                     };
//                 }
//                 if (row.transaction_id) { // Assuming transaction_id is a column in the transactions table
//                     acc[row.batch_id].transactions.push(row);
//                 }
//                 return acc;
//             }, {});

//             // Convert the object to an array
//             const response = Object.values(batchesWithTransactions);

//             res.status(200).json(response); // Send back the batches with their transactions
//         } else {
//             res.status(404).json({ message: 'No closed batches found.' });
//         }
//     } catch (err) {
//         console.error('Error fetching inactive batches:', err); // Log the actual error for debugging
//         const error = new Error('Unable to fetch inactive batches');
//         error.status = 500;
//         next(error); // Pass the error to the next middleware
//     }
// };




// export const getInactiveBatches = async (req, res, next) => {
//     try {
//         // Query to fetch batches, transactions, and chicks_inv in one go
//         const [results] = await db.execute(`
//             SELECT b.batch_id, b.start_date, b.end_date, t.transaction_id, t.transaction_date, 
//                 t.item_name, t.item_type, t.quantity, t.price_per_unit, t.total_cost, t.transaction_type, 
//                 ci.mortality
//             FROM batch b
//             LEFT JOIN transactions t ON b.batch_id = t.batch_id
//             LEFT JOIN chicks_inv ci ON b.batch_id = ci.batch_id
//             WHERE b.end_date IS NOT NULL
//         `);

//         // Group results by batch_id
//         const groupedResults = results.reduce((acc, item) => {
//             if (!acc[item.batch_id]) {
//                 acc[item.batch_id] = {
//                     batch_id: item.batch_id,
//                     start_date: item.start_date,
//                     end_date: item.end_date,
//                     transactions: [] // Initialize transactions array
//                 };
//             }

//             // Create a transaction object and include the mortality inside each transaction
//             const transaction = {
//                 transaction_id: item.transaction_id,
//                 transaction_date: item.transaction_date,
//                 item_name: item.item_name,
//                 item_type: item.item_type,
//                 quantity: item.quantity,
//                 price_per_unit: item.price_per_unit,
//                 total_cost: item.total_cost,
//                 transaction_type: item.transaction_type,
//                 contact_name: item.contact_name,
//                 mortality: item.mortality // Place mortality inside the transaction object
//             };

//             // Add the transaction to the transactions array for this batch
//             acc[item.batch_id].transactions.push(transaction);
//             return acc;
//         }, {});

//         // Convert groupedResults back to an array for response
//         const groupedArray = Object.values(groupedResults);

//         // Send the grouped results back to the client
//         res.status(200).json(groupedArray);
//     } catch (err) {
//         console.error('Error fetching inactive batches:', err); // Log the actual error for debugging
//         const error = new Error('Unable to fetch inactive batches');
//         error.status = 500;
//         next(error); // Pass the error to the next middleware
//     }
// };














export const getInactiveBatches = async (req, res, next) => {
    try {
        const [results] = await db.execute(`
            SELECT 
                b.batch_id, 
                b.batch_name, 
                b.start_date, 
                b.end_date, 
                t.transaction_id, 
                t.transaction_date, 
                t.transaction_type, 
                t.contact_name, 
                t.item_type, 
                t.item_name, 
                t.quantity, 
                t.price_per_unit, 
                t.total_cost, 
                ci.id AS chicks_inv_id, 
                ci.item_type AS chicks_item_type, 
                ci.item_name AS chicks_item_name, 
                ci.date AS chicks_date, 
                ci.amount_left, 
                ci.ready_to_harvest, 
                ci.undersize, 
                ci.sold, 
                ci.mortality
            FROM batch b
            LEFT JOIN transactions t ON b.batch_id = t.batch_id
            LEFT JOIN chicks_inv ci ON b.batch_id = ci.batch_id
            WHERE b.is_active = 0
        `);

        // Group results by batch_id
        const groupedResults = results.reduce((acc, item) => {
            const { 
                batch_id, 
                batch_name, 
                start_date, 
                end_date, 
                transaction_id, 
                transaction_date, 
                transaction_type, 
                contact_name, 
                item_type, 
                item_name, 
                quantity, 
                price_per_unit, 
                total_cost, 
                chicks_inv_id, 
                chicks_item_type, 
                chicks_item_name, 
                chicks_date, 
                amount_left, 
                ready_to_harvest, 
                undersize, 
                sold, 
                mortality 
            } = item;

            if (!acc[batch_id]) {
                acc[batch_id] = {
                    batch_id,
                    batch_name,
                    start_date,
                    end_date,
                    transactions: [],
                    chicks_inv: []
                };
            }

            // Add transaction if it exists and is not a duplicate
            if (transaction_id && !acc[batch_id].transactions.some(t => t.transaction_id === transaction_id)) {
                acc[batch_id].transactions.push({
                    transaction_id,
                    transaction_date,
                    transaction_type,
                    contact_name,
                    item_type,
                    item_name,
                    quantity,
                    price_per_unit,
                    total_cost
                });
            }

            // Add chicks inventory data if it exists and is not a duplicate
            if (chicks_inv_id && !acc[batch_id].chicks_inv.some(c => c.id === chicks_inv_id)) {
                acc[batch_id].chicks_inv.push({
                    id: chicks_inv_id,
                    // item_type: chicks_item_type,
                    // item_name: chicks_item_name,
                    // date: chicks_date,
                    // amount_left,
                    // ready_to_harvest,
                    // undersize,
                    // sold,
                    mortality
                });
            }

            return acc;
        }, {});

        // Convert grouped results into an array
        const groupedArray = Object.values(groupedResults);

        res.status(200).json(groupedArray);
    } catch (err) {
        console.error('Error fetching inactive batches:', err);
        const error = new Error('Unable to fetch inactive batches');
        error.status = 500;
        next(error);
    }
};



























export default router;