

/**
 * Handle incoming HTTP request
 *
 * @param  {FunctionRequest} request
 * @param  {FunctionSettings} settings
 */


async function onRequest(request, settings) {
    const eventMap = [
        { 'Tracking Plan Updated': 'NotfiyGitHub' }
    ];

    const body = request.json()
    const eventName = body.event;
    const requestType = body.type;
    let properties = body.properties;
    const userId = (body.userId) ? body.userId : '00_system_audit_function';

    if (eventName == 'Audit' && requestType == 'track') {
        if (properties.type == 'Tracking Plan Modified') {

            properties.testProperty = 'Chris Test';

            await notifyGithub(properties, settings);

            Segment.track({
                event: eventName + ' TEST',
                userId: userId,
                properties: properties
            });
        } else {
            Segment.track({
                event: 'NOT TRACKING PLAN',
                userId: userId,
                properties: properties
            });
        }
    } else {
        Segment.track({
            event: 'NO AUDIT',
            userId: userId,
            properties: { testProperty: "Chris" }
        });
    }
}

/**
 * Handle track event
 * @param  {SegmentTrackEvent} event
 * @param  {FunctionSettings} settings
 */
async function onTrack(event, settings) {
    const eventName = event.event;
    const requestType = event.type;
    let properties = event.properties;
    const userId = event.userId ? event.userId : '00_system_audit_function';

    if (eventName == 'Audit' && requestType == 'track') {
        if (properties.type == 'Tracking Plan Modified') {

            await notifyGithub(properties, settings);

            Segment.track({
                event: eventName + ' TEST (onTrack)',
                userId: userId,
                properties: properties
            });
        
        }
    }

    return;
}

async function notifyGithub(body, settings) {
    const endpoint = 'https://webhook.site/48bbf872-4040-4cb9-9853-6b0bafd516d7'; 
    let response;

    try {
        response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                // Authorization: `Basic ${btoa(settings.apiKey + ':')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
    } catch (error) {
        // Retry on connection error
        throw new RetryError(error.message)
    }

    if (response.status >= 500 || response.status === 429) {
        // Retry on 5xx (server errors) and 429s (rate limits)
        throw new RetryError(`Failed with ${response.status}`)
    }

}