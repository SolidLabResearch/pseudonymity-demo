
async function flow() {
    /**
     *  Phase 1: Diploma verification
     */
    const phase1 = async ()=>  {

        // TODO: anonymizer requests which claims are required for the diploma verification

        // TODO: anonymizer retrieves necessary diploma credential

        // TODO: anonymizer derives diploma credential, and creates & signs VP01

        // TODO: anonymizer sends VP01 to recruiter

        // TODO: recruiter responds with verification result VPR01 (indicating result of the job selection
        //  & the endpoint to start the second phase

        const result = { selected: false, uriPhase2: undefined };
        return result;
    };

    /**
     *
     */
    const phase2 = async () => {

        return;
    };

    const {selected, uriPhase2} = await phase1();
    if(selected) {
        const resultPhase2 = await phase2();

    }

}
