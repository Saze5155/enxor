module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log(`[Socket] User connected: ${socket.id}`);

        // Join Campaign Room (Global for now)
        socket.on('join_campaign', (campaignId) => {
            const room = `campaign_${campaignId}`;
            socket.join(room);
            socket.join(`${room}_secret`); // Everyone joins secret for now, logic below handles distribution
            console.log(`[Socket] ${socket.id} joined ${room} and secret channel`);
        });

        // Chat Message
        socket.on('chat_message', (data) => {
            // data: { campaignId, sender, text, type (public/secret/mj), role (senderRole) }
            const { campaignId, text, sender, type, role } = data;
            
            let room;
            if (type === 'public') room = `campaign_${campaignId}`;
            else if (type === 'secret') room = `campaign_${campaignId}_players`; // Only players join this
            else if (type === 'mj') room = `campaign_${campaignId}_mj`; // MJ + sender logic needed, simplified for first pass to broadcast to MJ room

            // Basic room logic for prototyping:
            // Public -> Everyone
            // Secret -> Players only (MJ should not verify/join this room in client unless logic changes)
            // MJ -> Logic is complex (Point to Point). For now let's use global broadcast but client filter or distinct room.
            
            // let's stick to room names:
            // Public: campaign_{id}
            // Secret (Groupe): campaign_{id}_secret
            // MJ DM: campaign_{id}_mjchannel (or simple broadcast filtered by client)
            
            const targetRoom = type === 'public' ? `campaign_${campaignId}` 
                             : type === 'secret' ? `campaign_${campaignId}_secret`
                             : `campaign_${campaignId}`; // mj_dm falls back to global broadcast for now (filtered by client)

            io.to(targetRoom).emit('chat_message', {
                id: Date.now(),
                sender,
                text,
                type,
                target: data.target, // Pass target for DM filtering
                timestamp: new Date().toISOString()
            });
        });

        // Dice Roll
        socket.on('dice_roll', (data) => {
            // data: { campaignId, rollerName, rollResult, formula, type }
            const { campaignId } = data;
            const room = `campaign_${campaignId}`;

            io.to(room).emit('dice_roll', {
                ...data,
                id: Date.now(),
                timestamp: new Date().toISOString()
            });
        });



        // Blind Mode Toggle
        socket.on('toggle_blind_mode', (data) => {
            const { campaignId, enabled } = data;
            io.to(`campaign_${campaignId}`).emit('blind_mode_update', enabled);
        });

        // Modifier Sync (MJ sets modifier for player)
        socket.on('force_modifier', (data) => {
            const { campaignId, targetId, modifier } = data;
            io.to(`campaign_${campaignId}`).emit('modifier_updated', { targetId, modifier });
        });

        socket.on('disconnect', () => {
            console.log(`[Socket] User disconnected: ${socket.id}`);
        });
    });
};
