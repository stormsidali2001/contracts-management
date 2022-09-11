import { cardsData } from '../../data'
import Card from '../Card/Card'
import styles from './Cards.module.css'

const Cards = () => {
  return (
    <div className={styles.container}>
        {
            cardsData.map((card,index)=>{
                return (
                    <div key={index} className={styles.cardWrapper}>
                        <Card
                            title = {card.title}
                            styles = {card.styles}
                            barValue = {card.barValue}
                            png = {card.png}
                            series = {card.series}
                        />
                    </div>
                )
            })
        }
    </div>
  )
}

export default Cards