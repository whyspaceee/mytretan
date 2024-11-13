// import { pusher } from "~/server/soketi/soketi";
// import Pusher from 'pusher-js';


// export async function GET(request: Request) {
//     const soketi = pusher

//     const ta = new Pusher('app-key', {
//         wsHost: '127.0.0.1',
//         wsPort: 6001,
//         forceTLS: false,
//         disableStats: true,
//         enabledTransports: ['ws', 'wss'],
//     });
    
//     ta.subscribe('channel-1').bind('test_event', (message : any) => {
//         console.log(message.message);
//     });

//     soketi.trigger("channel-1", "test_event", { message: "hello world!" })

    

//     const a  = await soketi
//         .get({ path: "/channels", params: {} })

//     const res = await a.json()
    
//     return Response.json(res)
        
// }

