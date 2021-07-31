import { AccountType, UserType } from "../../components/constants/securspace-constants";

class AccountUtilService {
    static userNeedsTosConfirmation = (user: {
        type: String,
        userType: String,
        hasAcceptedCurrentTos: boolean }) : void => {

        return user
            && user.userType === UserType.OWNER
            && user.type !== AccountType.ADMIN
            && !user.hasAcceptedCurrentTos
    }
}

export default AccountUtilService
