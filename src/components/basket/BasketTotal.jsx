import { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../AppContext';
import { findProduct, findVoucher } from '../../lib/database';
import VoucherRate from './VoucherRate';
import ButtonPay from './ButtonPay';
// import { findVoucher } from '../../lib/database'
export default function BasketTotal(props) {

    const [state, setState] = useState({
        totalPrice: 0
        , tva: 0
        , HTprice: 0
        , inputValue: ""
        , infoVoucher: ""
        , useVoucher: false
    })

    const context = useContext(AppContext);
    let basket = context.basket;
    // Retourne le total du panier
    function getTotal() {
        let total = basket.map((element) => {
            return findProduct(element.productCode).unitPrice * element.qty
        })
        return total.reduce((a, b) => a + b)
    }

    function getTva(price) {
        return price * 0.05
    }

    function getVoucher() {

        //Si le code saisie est bien un code promo, et si aucun code n'a été utilisé, j'applique celui ci sur le total
        if (findVoucher(state.inputValue)) {

            let voucher = findVoucher(state.inputValue)
            //calcul nouveau total
            let newTotal = state.totalPrice - (voucher * state.totalPrice)
            setState({ ...state, totalPrice: newTotal, tva: getTva(newTotal), HTprice: newTotal - getTva(newTotal), infoVoucher: `Promo de -${voucher * 100}% appliqué`, useVoucher: true });

            //On stocke le voucher dans le contexte pour l'envoyer au back
            context.setVoucherRate(voucher);
        }
        //sinon je retourne le total normal    
        else {
            setState({ ...state, totalPrice: getTotal(), tva: getTva(getTotal()), HTprice: getTotal() - getTva(getTotal()), infoVoucher: 'Code promo non valide' })
        }
        console.log(state);
    }


    function removeVoucher() {
        setState({ ...state, totalPrice: getTotal(), tva: getTva(getTotal()), HTprice: getTotal() - getTva(getTotal()), inputValue: "", infoVoucher: "", useVoucher: false })
    }


    function handleChange(e) {

        setState({ ...state, inputValue: e.target.value })


        // permet de gerer le state de manière synchrone pour récupérer la dernière valeur connue du state
        // setState((state) => { return { ...state, inputValue: e.target.value } })
    }

    //Lorsque que le panier change, on applique le nouveau total
    useEffect(() => {
        let total = getTotal()
        //Si j'ai un code promo d'appliqué, je l'applique sur mon total
        if (findVoucher(state.inputValue) !== false) {
            total = total - (findVoucher(state.inputValue) * total)
        }

        setState({
            ...state
            , totalPrice: total
            , tva: getTva(total)
            , HTprice: total - getTva(total)
        })

    }, [context])

    return (

        <div className="basket_total">
            <h3>Total</h3>
            <p>Prix ht - {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(state.HTprice)}</p>
            <p>Tva 5.5% - {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(state.tva)}</p>
            <VoucherRate onChange={handleChange} onClick={() => getVoucher()} val={state.inputValue} onClickDelete={removeVoucher} infoVoucher={state.infoVoucher} use={state.useVoucher} />
            <p>Prix TTC - {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(state.totalPrice)}</p>
            <ButtonPay />
        </div>

    )
}