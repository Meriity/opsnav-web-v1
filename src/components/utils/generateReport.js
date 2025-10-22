// generateReport.js
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateTaskAllocationPDF = () => {
    try {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        // 🔹 Get and parse data from localStorage
        const storedData = localStorage.getItem("client-storage");
        if (!storedData) {
            console.error("No client-storage found in localStorage");
            return;
        }

        const parsed = JSON.parse(storedData);
        const tasks = parsed.state.clients;

        console.log("Tasks data:", tasks);

        // 🔹 Title
        doc.setFontSize(16);
        doc.text("Task Allocation Report - IDG Services", 14, 15);

        // 🔹 Prepare table headers and rows
        const headers = [
            ["Order ID", "Client Name", "Delivery Address", "Order Date", "Delivery Date", "Allocated User"],
        ];

        const rows = tasks.map(task => [
            task.orderId || "N/A",
            task.client_name || "N/A",
            task.billing_address || "N/A",
            task.order_date || "N/A",
            task.delivery_date || "N/A",
            task.allocatedUser || "N/A"
        ]);


        // ✅ Use autoTable correctly
        autoTable(doc, {
            head: headers,
            body: rows,
            startY: 25,
            theme: "striped",
        });

        doc.text(
            "Powered by Opsnav",
            pageWidth / 2,   
            pageHeight - 10,  
            { align: 'center' }
        );


        // 🔹 Save PDF
        doc.save(`TAR - ${new Date().toLocaleDateString('en-GB')}.pdf`);
    } catch (err) {
        console.error("Error generating PDF: ", err);
    }
};
